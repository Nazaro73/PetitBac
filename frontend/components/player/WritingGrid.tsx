"use client";

import { useGameStore } from "@/store/gameStore";

interface Props {
  categories: string[];
  letter: string | null;
  onSubmit: () => void;
  finished: boolean;
}

export function WritingGrid({ categories, letter, onSubmit, finished }: Props) {
  const draftWords = useGameStore((s) => s.draftWords);
  const setDraftWord = useGameStore((s) => s.setDraftWord);

  function handleChange(category: string, value: string) {
    setDraftWord(category, value.slice(0, 40));
  }

  return (
    <div className="card space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="h-display text-2xl">
          À vos marques, lettre <span className="pop-text">{letter}</span>
        </h2>
        <span className="text-xs text-ink/60 font-semibold">
          Envoi au STOP uniquement.
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const value = draftWords[category] ?? "";
          const startsOk =
            !value || !letter || value.trim().charAt(0).toUpperCase() === letter;
          return (
            <label key={category} className="block">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="h-display text-base">
                  <span className="hl">{category}</span>
                </span>
                {value && !startsOk && (
                  <span className="text-xs font-bold text-accent-600">
                    ne commence pas par {letter}
                  </span>
                )}
              </div>
              <input
                className="input"
                value={value}
                onChange={(e) => handleChange(category, e.target.value)}
                placeholder={`Un ${category.toLowerCase()} en « ${letter ?? "?"} »`}
                disabled={finished}
                autoComplete="off"
              />
            </label>
          );
        })}
      </div>

      <button
        className="btn-accent w-full py-3 text-base h-display tracking-wide"
        onClick={onSubmit}
        disabled={finished}
      >
        {finished ? "Grille envoyée — en attente du STOP…" : "J'AI TERMINÉ MA GRILLE"}
      </button>
    </div>
  );
}
