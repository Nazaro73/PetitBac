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
    <div className="card space-y-5">
      <div>
        <h2 className="text-lg font-bold">Configuration de la manche</h2>
        <p className="text-xs text-slate-500">
          Les catégories sont immédiatement visibles par les joueurs.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-300">
          Catégories
        </label>
        <ul className="mb-2 flex flex-wrap gap-2">
          {categories.map((c, idx) => (
            <li
              key={c}
              className="group flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 py-1 pl-3 pr-1 text-sm"
            >
              <span>{c}</span>
              <button
                onClick={() => removeCategory(idx)}
                className="ml-1 rounded-full bg-slate-700 hover:bg-red-500 h-5 w-5 text-xs font-bold flex items-center justify-center"
                aria-label={`Retirer ${c}`}
              >
                ×
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="text-xs text-amber-400">Ajoutez au moins une catégorie.</li>
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
        <label className="mb-2 block text-sm font-semibold text-slate-300">
          Lettre
        </label>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand-600/20 border border-brand-500/30 text-4xl font-black text-brand-200">
            {letter || "?"}
          </div>
          <button className="btn-secondary" onClick={pickRandomLetter}>
            Tirer au sort
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {LETTERS.map((l) => (
            <button
              key={l}
              onClick={() => setLetter(l)}
              className={`h-8 w-8 rounded text-sm font-bold transition ${
                letter === l
                  ? "bg-brand-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-success w-full py-3 text-base"
        disabled={disabled || !letter || categories.length === 0}
        onClick={handleStart}
      >
        Démarrer la manche
      </button>
    </div>
  );
}
