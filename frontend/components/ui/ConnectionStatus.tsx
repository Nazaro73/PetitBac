"use client";

interface Props {
  connected: boolean;
  error?: string | null;
}

export function ConnectionStatus({ connected, error }: Props) {
  if (error) {
    return (
      <span className="badge bg-red-500/20 text-red-300 border border-red-500/30">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Erreur : {error}
      </span>
    );
  }
  if (connected) {
    return (
      <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Connecté
      </span>
    );
  }
  return (
    <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30">
      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      Connexion…
    </span>
  );
}
