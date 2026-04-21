// Mini-scénario de bout en bout :
// 1. Un MJ se connecte et réclame le rôle.
// 2. Deux joueurs rejoignent.
// 3. Le MJ lance une manche.
// 4. Les joueurs envoient leurs mots.
// 5. Le MJ valide quelques verdicts + applique une pénalité.
// 6. On vérifie les scores finaux.
//
// Utilisation : node backend/scripts/smoke-test.mjs
// Nécessite d'avoir le backend lancé sur localhost:4001.

import { io } from "socket.io-client";

const URL = process.env.SMOKE_URL ?? "http://localhost:4001";
const results = [];

function connect() {
  return new Promise((resolve) => {
    const s = io(URL, { transports: ["websocket"] });
    s.on("connect", () => resolve(s));
  });
}

function ack(socket, event, payload) {
  return new Promise((resolve) => socket.emit(event, payload, resolve));
}

// Collecte passive : dès qu'un socket est créé, on agrège tous les events
// reçus pour pouvoir les inspecter après coup sans se préoccuper de
// l'ordre d'arrivée relatif à nos awaits.
function track(socket) {
  const state = { publicStates: [], mjStates: [], roundStarted: [] };
  socket.on("players_update", (s) => state.publicStates.push(s));
  socket.on("mj_state", (s) => state.mjStates.push(s));
  socket.on("round_started", (p) => state.roundStarted.push(p));
  return state;
}

async function run() {
  const mjId = "mj-" + Date.now();
  const p1Id = "p1-" + Date.now();
  const p2Id = "p2-" + Date.now();

  const mj = await connect();
  const p1 = await connect();
  const p2 = await connect();

  const mjTrack = track(mj);
  const p1Track = track(p1);
  track(p2);

  await ack(mj, "hello", { clientId: mjId });
  await ack(p1, "hello", { clientId: p1Id });
  await ack(p2, "hello", { clientId: p2Id });

  const claim = await ack(mj, "mj_claim", { clientId: mjId });
  results.push(["mj_claim ok", claim?.ok === true]);

  const j1 = await ack(p1, "join_game", { clientId: p1Id, name: "Alice" });
  const j2 = await ack(p2, "join_game", { clientId: p2Id, name: "Bob" });
  results.push(["players joined", j1?.ok === true && j2?.ok === true]);

  const start = await ack(mj, "start_round", {
    letter: "C",
    categories: ["Pays", "Animal"],
  });
  results.push(["start_round ok", start?.ok === true]);
  results.push([
    "players received round_started",
    p1Track.roundStarted.length > 0,
  ]);

  await ack(p1, "submit_words", { words: { Pays: "Canada", Animal: "Chat" } });
  await ack(p2, "submit_words", { words: { Pays: "Chine", Animal: "Chat" } });

  const stop = await ack(mj, "stop_round", {});
  results.push(["stop_round ok", stop?.ok === true]);

  await ack(mj, "mj_validate_word", {
    playerClientId: p1Id,
    category: "Pays",
    verdict: 2,
  });
  await ack(mj, "mj_validate_word", {
    playerClientId: p1Id,
    category: "Animal",
    verdict: 1,
  });
  await ack(mj, "mj_validate_word", {
    playerClientId: p2Id,
    category: "Pays",
    verdict: 1,
  });
  await ack(mj, "mj_validate_word", {
    playerClientId: p2Id,
    category: "Animal",
    verdict: 1,
  });
  await ack(mj, "mj_apply_penalty", { playerClientId: p2Id, delta: -1 });

  // Donne un tick au serveur pour propager le dernier broadcast.
  await new Promise((r) => setTimeout(r, 100));

  const last = mjTrack.publicStates[mjTrack.publicStates.length - 1];
  const alice = last.players.find((p) => p.clientId === p1Id);
  const bob = last.players.find((p) => p.clientId === p2Id);

  results.push(["alice score = 3 (2+1)", alice?.score === 3]);
  results.push(["bob score = 1 (1+1-1)", bob?.score === 1]);

  const lastMJ = mjTrack.mjStates[mjTrack.mjStates.length - 1];
  results.push([
    "MJ sees answers for both players",
    lastMJ?.answers &&
      Object.keys(lastMJ.answers).includes(p1Id) &&
      Object.keys(lastMJ.answers).includes(p2Id),
  ]);

  mj.close();
  p1.close();
  p2.close();
}

run()
  .then(() => {
    const fails = results.filter(([, ok]) => !ok);
    for (const [name, ok] of results) {
      console.log(ok ? "✓" : "✗", name);
    }
    if (fails.length > 0) {
      console.error(`\n${fails.length} check(s) failed`);
      process.exit(1);
    } else {
      console.log(`\n${results.length} checks passed`);
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("Smoke test failed:", err);
    process.exit(1);
  });
