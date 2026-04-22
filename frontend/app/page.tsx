"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, saveSession } from "@/lib/clientId";

type Mode = "player" | "mj";

type ServerStatus = { mjClaimed: boolean; phase: string; playerCount: number };

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("player");
  const [name, setName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [mjSecret, setMjSecret] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const trimmed = serverUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//.test(trimmed)) {
      setServerStatus(null);
      setStatusError(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`${trimmed}/status`, {
        headers: { "ngrok-skip-browser-warning": "true" },
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data: ServerStatus) => {
          setServerStatus(data);
          setStatusError(null);
        })
        .catch((e: Error) => {
          if (e.name === "AbortError") return;
          setServerStatus(null);
          setStatusError(e.message || "Serveur injoignable");
        });
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [serverUrl]);

  const mjBlocked = serverStatus?.mjClaimed === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = serverUrl.trim().replace(/\/+$/, "");
    if (!trimmed) return;
    if (!/^https?:\/\//.test(trimmed)) return;
    if (mode === "player" && !name.trim()) return;
    if (mode === "mj" && !mjSecret.trim()) return;

    setAuthError(null);

    if (mode === "mj") {
      setSubmitting(true);
      try {
        const res = await fetch(`${trimmed}/auth/mj`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ secret: mjSecret.trim() }),
        });
        if (res.status === 401) {
          setAuthError("Mot de passe MJ incorrect.");
          return;
        }
        if (res.status === 409) {
          setAuthError("Une partie est déjà en cours sur ce serveur.");
          return;
        }
        if (!res.ok) {
          setAuthError(`Erreur serveur (${res.status}).`);
          return;
        }
      } catch {
        setAuthError("Impossible de joindre le serveur.");
        return;
      } finally {
        setSubmitting(false);
      }
    }

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
          <span className="pop-text pop-text-outlined">PETIT BAC</span>
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
              Mot de passe MJ
            </label>
            <input
              id="secret"
              className="input"
              placeholder="Mot de passe configuré côté backend"
              value={mjSecret}
              onChange={(e) => setMjSecret(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
            />
            <p className="mt-1 text-xs text-ink/60">
              Correspond à la variable <code className="font-mono bg-citron-100 px-1 rounded">MJ_SECRET</code> du backend (fichier <code className="font-mono bg-citron-100 px-1 rounded">.env</code>).
            </p>
          </div>
        )}

        {mjBlocked && mode === "mj" && (
          <p className="rounded-lg border-2 border-ink bg-citron-100 p-3 text-sm font-medium text-ink">
            Une partie est déjà en cours. Le bon mot de passe te permettra de reprendre le rôle de MJ.
          </p>
        )}

        {authError && (
          <p className="rounded-lg border-2 border-accent-500 bg-accent-50 p-3 text-sm font-bold text-accent-700">
            {authError}
          </p>
        )}

        {statusError && serverUrl.trim() && (
          <p className="text-xs text-ink/60">
            Impossible de joindre le serveur ({statusError}).
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 text-base h-display tracking-wide ${
            mode === "mj" ? "btn-accent" : "btn-primary"
          } ${submitting ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          {submitting
            ? "VÉRIFICATION…"
            : mode === "mj"
              ? "OUVRIR LE TABLEAU MJ"
              : "REJOINDRE LA PARTIE"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-ink/60">
        Les informations saisies sont conservées uniquement dans votre navigateur.
      </p>
    </main>
  );
}
