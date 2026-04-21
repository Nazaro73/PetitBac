const DEFAULT_CATEGORIES = ["Pays", "Prénom", "Animal", "Métier", "Objet"];

function parseOrigins(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "",
  extraOrigins: parseOrigins(process.env.EXTRA_ORIGINS ?? ""),
  mjSecret: process.env.MJ_SECRET ?? "",
  defaultCategories: DEFAULT_CATEGORIES,
};

export function buildAllowedOrigins() {
  const origins = new Set();
  if (config.frontendUrl) origins.add(config.frontendUrl);
  for (const o of config.extraOrigins) origins.add(o);
  // Toujours autoriser localhost pour le dev local du front.
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return [...origins];
}
