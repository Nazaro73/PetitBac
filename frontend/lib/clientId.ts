const STORAGE_KEY = "petit-bac.clientId";

/**
 * Identifiant client persistant stocké en localStorage, survivant aux
 * rafraîchissements de page. Utilisé par le backend pour recoller un
 * joueur à ses scores en cas de perte de socket.
 */
export function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export function resetClientId(): string {
  if (typeof window === "undefined") return "";
  const id = generateId();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return (
    "id-" +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36)
  );
}

const SESSION_KEY = "petit-bac.session";

export interface PersistedSession {
  role: "mj" | "player";
  serverUrl: string;
  name: string;
  mjSecret?: string;
}

export function saveSession(session: PersistedSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): PersistedSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
