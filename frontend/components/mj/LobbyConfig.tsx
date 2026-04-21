"use client";

import { useEffect, useState } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  initialCategories: string[];
  onStart: (payload: { letter: string; categories: string[] }) => void;
  onUpdateCategories: (categories: string[]) => void;
  disabled?: boolean;
}

export function LobbyConfig({
  initialCategories,
  onStart,
  onUpdateCategories,
  disabled,
}: Props) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [letter, setLetter] = useState<string>("");

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories.join("|")]);

  function persist(next: string[]) {
    setCategories(next);
    onUpdateCategories(next);
  }

  function addCategory() {
    const val = newCategory.trim();
    if (!val) return;
    if (categories.includes(val)) return;
    persist([...categories, val].slice(0, 12));
    setNewCategory("");
  }

  function removeCategory(idx: number) {
    persist(categories.filter((_, i) => i !== idx));
  }

  function pickRandomLetter() {
    setLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  }

  function handleStart() {
    if (!letter || categories.length === 0) return;
    onStart({ letter, categories });
  }

  return (
    <div className="card space-y-6">
      <div>
        <h2 className="h-display text-2xl">
          <span className="hl">Configuration</span> de la manche
        </h2>
        <p className="text-xs font-semibold text-ink/60">
          Les catégories sont immédiatement visibles par les joueurs.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          Catégories
        </label>
        <ul className="mb-2 flex flex-wrap gap-2">
          {categories.map((c, idx) => (
            <li
              key={c}
              className="flex items-center gap-1 rounded-full border-[3px] border-ink bg-white py-1 pl-3 pr-1 text-sm font-bold shadow-pop-sm"
            >
              <span>{c}</span>
              <button
                onClick={() => removeCategory(idx)}
                className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-accent-500 text-xs font-black text-white hover:rotate-90 transition"
                aria-label={`Retirer ${c}`}
              >
                ×
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-xs font-bold text-accent-600">
              Ajoutez au moins une catégorie.
            </li>
          )}
        </ul>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Ajouter une catégorie (ex: Fruit)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            maxLength={30}
          />
          <button className="btn-secondary shrink-0" onClick={addCategory}>
            Ajouter
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
          Lettre
        </label>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-[3px] border-ink bg-white text-5xl font-black shadow-pop-sm">
            <span className={letter ? "pop-text" : "text-ink/30"}>
              {letter || "?"}
            </span>
          </div>
          <button className="btn-citron" onClick={pickRandomLetter}>
            Tirer au sort
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => setLetter(l)}
              className={`h-9 w-9 rounded-lg border-2 border-ink text-sm font-black transition ${
                letter === l
                  ? "bg-accent-500 text-white shadow-pop-sm -translate-y-0.5"
                  : "bg-white hover:bg-brand-100"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-primary w-full py-3 text-base h-display tracking-wide"
        disabled={disabled || !letter || categories.length === 0}
        onClick={handleStart}
      >
        DÉMARRER LA MANCHE
      </button>
    </div>
  );
}
