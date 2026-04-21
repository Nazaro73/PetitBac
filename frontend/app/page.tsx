"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, saveSession } from "@/lib/clientId";

type Mode = "player" | "mj";

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("player");
  const [name, setName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [mjSecret, setMjSecret] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setMode(saved.role);
      setName(saved.name);
      setServerUrl(saved.serverUrl);
      setMjSecret(saved.mjSecret ?? "");
    }
    setHydrated(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = serverUrl.trim().replace(/\/+$/, "");
    if (!trimmed) return;
    if (!/^https?:\/\//.test(trimmed)) return;
    if (mode === "player" && !name.trim()) return;

    saveSession({
      role: mode,
      serverUrl: trimmed,
      name: name.trim() || "MJ",
      mjSecret: mode === "mj" ? mjSecret.trim() : undefined,
    });
    router.push(mode === "mj" ? "/mj" : "/player");
  }

  if (!hydrated) {
    return <div className="p-8 text-ink/60">Chargement…</div>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="h-display text-5xl sm:text-6xl leading-none">
          <span className="pop-text">PETIT BAC</span>
        </h1>
        <p className="mt-3 text-xs uppercase tracking-[0.35em] text-ink/70 font-bold">
          Édition <span className="hl">Maître du Jeu</span>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="mb-3 block text-sm font-bold uppercase tracking-wider">
            Je suis…
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("player")}
              className={`rounded-xl border-[3px] border-ink p-4 text-left transition ${
                mode === "player"
                  ? "bg-brand-500 shadow-pop-sm"
                  : "bg-white hover:bg-brand-50"
              }`}
            >
              <div className="h-display text-lg">JOUEUR</div>
              <div className="text-xs text-ink/70 font-medium">
                Je rejoins une partie hébergée par un MJ.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("mj")}
              className={`rounded-xl border-[3px] border-ink p-4 text-left transition ${
                mode === "mj"
                  ? "bg-accent-500 text-white shadow-pop-sm"
                  : "bg-white hover:bg-accent-50"
              }`}
            >
              <div className="h-display text-lg">MAÎTRE DU JEU</div>
              <div className={`text-xs font-medium ${mode === "mj" ? "text-white/90" : "text-ink/70"}`}>
                J'héberge le backend en Docker.
              </div>
            </button>
          </div>
        </div>

        {mode === "player" && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-bold uppercase tracking-wider">
              Pseudo
            </label>
            <input
              id="name"
              className="input"
              placeholder="Ex. Paulette"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="url" className="mb-2 block text-sm font-bold uppercase tracking-wider">
            URL du serveur <span className="text-ink/60 font-medium normal-case">(fournie par le MJ)</span>
          </label>
          <input
            id="url"
            className="input"
            placeholder="https://xxxx.ngrok-free.app"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            inputMode="url"
            required
          />
          <p className="mt-1 text-xs text-ink/60">
            Doit commencer par <code className="font-mono bg-citron-100 px-1 rounded">https://</code>.
          </p>
        </div>

        {mode === "mj" && (
          <div>
            <label htmlFor="secret" className="mb-2 block text-sm font-bold uppercase tracking-wider">
              Jeton MJ <span className="text-ink/60 font-medium normal-case">(optionnel)</span>
            </label>
            <input
              id="secret"
              className="input"
              placeholder="Laissez vide si non configuré"
              value={mjSecret}
              onChange={(e) => setMjSecret(e.target.value)}
              type="password"
            />
            <p className="mt-1 text-xs text-ink/60">
              Correspond à la variable <code className="font-mono bg-citron-100 px-1 rounded">MJ_SECRET</code> du backend.
            </p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-3 text-base h-display tracking-wide ${
            mode === "mj" ? "btn-accent" : "btn-primary"
          }`}
        >
          {mode === "mj" ? "OUVRIR LE TABLEAU MJ" : "REJOINDRE LA PARTIE"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink/60">
        Les informations saisies sont conservées uniquement dans votre navigateur.
      </p>
    </main>
  );
}
