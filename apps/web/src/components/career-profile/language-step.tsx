'use client';

import { useProfileStore } from '@/store/profile.store';
import { Plus, Trash2 } from 'lucide-react';

const proficiencies = ['native', 'fluent', 'intermediate', 'basic'];

function emptyLang() {
  return { id: crypto.randomUUID(), name: '', proficiency: 'intermediate' };
}

export default function LanguageStep() {
  const { profile, updateProfile } = useProfileStore();
  const items = profile.languages;

  const update = (id: string, field: string, value: string) => {
    updateProfile({ languages: items.map((l) => (l.id === id ? { ...l, [field]: value } : l)) });
  };

  const add = () => updateProfile({ languages: [...items, emptyLang()] });
  const remove = (id: string) => updateProfile({ languages: items.filter((l) => l.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Languages</h2>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No languages added yet. Click &quot;Add&quot; to begin.</p>
      )}

      {items.map((lang) => (
        <div key={lang.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-end">
            <button onClick={() => remove(lang.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <input value={lang.name} onChange={(e) => update(lang.id, 'name', e.target.value)} placeholder="English" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Proficiency</label>
              <select value={lang.proficiency} onChange={(e) => update(lang.id, 'proficiency', e.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                {proficiencies.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
