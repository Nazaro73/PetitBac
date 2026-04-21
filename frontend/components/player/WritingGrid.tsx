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
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Remplissez vos cases — lettre <span className="text-brand-300">{letter}</span>
        </h2>
        <span className="text-xs text-slate-500">
          Les saisies ne sont envoyées qu'au STOP.
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const value = draftWords[category] ?? "";
          const startsOk =
            !value || !letter || value.trim().charAt(0).toUpperCase() === letter;
          return (
            <label key={category} className="block">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">{category}</span>
                {value && !startsOk && (
                  <span className="text-xs text-amber-400">
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
        className="btn-primary w-full py-3 text-base disabled:opacity-40"
        onClick={onSubmit}
        disabled={finished}
      >
        {finished ? "Grille envoyée, en attente du STOP…" : "J'ai terminé ma grille"}
      </button>
    </div>
  );
}
