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
    return <div className="p-8 text-slate-400">Chargement…</div>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-brand-200">
          Petit Bac
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-brand-400/70">
          Édition Maître du Jeu
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Je suis…
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("player")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "player"
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
              }`}
            >
              <div className="text-lg font-bold">Joueur</div>
              <div className="text-xs text-slate-400">
                Je rejoins une partie hébergée par un MJ.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("mj")}
              className={`rounded-xl border p-4 text-left transition ${
                mode === "mj"
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-slate-700 bg-slate-900/40 hover:border-slate-600"
              }`}
            >
              <div className="text-lg font-bold">Maître du Jeu</div>
              <div className="text-xs text-slate-400">
                J'héberge le backend en Docker.
              </div>
            </button>
          </div>
        </div>

        {mode === "player" && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-300">
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
          <label htmlFor="url" className="mb-2 block text-sm font-semibold text-slate-300">
            URL du serveur (fournie par le MJ)
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
          <p className="mt-1 text-xs text-slate-500">
            Doit commencer par <code>https://</code> (ou <code>http://</code> en local).
          </p>
        </div>

        {mode === "mj" && (
          <div>
            <label htmlFor="secret" className="mb-2 block text-sm font-semibold text-slate-300">
              Jeton MJ <span className="text-slate-500 font-normal">(optionnel)</span>
            </label>
            <input
              id="secret"
              className="input"
              placeholder="Laissez vide si non configuré"
              value={mjSecret}
              onChange={(e) => setMjSecret(e.target.value)}
              type="password"
            />
            <p className="mt-1 text-xs text-slate-500">
              Correspond à la variable <code>MJ_SECRET</code> du backend.
            </p>
          </div>
        )}

        <button type="submit" className="btn-primary w-full py-3 text-base">
          {mode === "mj" ? "Ouvrir le tableau de bord MJ" : "Rejoindre la partie"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Les informations saisies sont conservées uniquement dans votre navigateur.
      </p>
    </main>
  );
}
