'use client';

import { useState } from 'react';
import { useProfileStore } from '@/store/profile.store';
import { Plus, X } from 'lucide-react';

const categories = ['Programming Languages', 'Automation', 'Cloud & DevOps', 'Databases', 'Frontend', 'Backend', 'Testing', 'Tools & Others'];

export default function SkillsStep() {
  const { profile, updateProfile } = useProfileStore();
  const [input, setInput] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const add = () => {
    if (!input.trim()) return;
    updateProfile({
      skills: [...profile.skills, { id: crypto.randomUUID(), name: input.trim(), category, level: 'intermediate' }],
    });
    setInput('');
  };

  const remove = (id: string) => {
    updateProfile({ skills: profile.skills.filter((s) => s.id !== id) });
  };

  const grouped = categories.reduce(
    (acc, cat) => {
      acc[cat] = profile.skills.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<string, typeof profile.skills>,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Skills</h2>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-auto rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Type a skill and press Enter"
          className="flex-1 w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <button onClick={add} className="w-full sm:w-auto rounded-lg bg-[var(--primary)] px-3 py-2 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {categories.map((cat) => {
        const skills = grouped[cat];
        if (!skills || skills.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-sm">
                  {s.name}
                  <button onClick={() => remove(s.id)} className="text-[var(--muted-foreground)] hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {profile.skills.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No skills added yet. Type a skill above and click Add.</p>
      )}
    </div>
  );
}
