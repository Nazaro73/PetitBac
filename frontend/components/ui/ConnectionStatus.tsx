"use client";

interface Props {
  connected: boolean;
  error?: string | null;
}

export function ConnectionStatus({ connected, error }: Props) {
  if (error) {
    return (
      <span className="badge bg-accent-500 text-white">
        <span className="h-2 w-2 rounded-full bg-white" />
        Erreur : {error}
      </span>
    );
  }
  if (connected) {
    return (
      <span className="badge bg-brand-500">
        <span className="h-2 w-2 rounded-full bg-ink" />
        Connecté
      </span>
    );
  }
  return (
    <span className="badge bg-citron-500">
      <span className="h-2 w-2 rounded-full bg-ink animate-pulse" />
      Connexion…
    </span>
  );
}
