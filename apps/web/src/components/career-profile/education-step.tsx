'use client';

import { useProfileStore } from '@/store/profile.store';
import { Plus, Trash2 } from 'lucide-react';

function emptyEdu() {
  return { id: crypto.randomUUID(), degree: '', institution: '', location: '', startYear: '', endYear: '', cgpa: '' };
}

export default function EducationStep() {
  const { profile, updateProfile } = useProfileStore();
  const items = profile.education;

  const update = (id: string, field: string, value: string) => {
    updateProfile({ education: items.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
  };

  const add = () => updateProfile({ education: [...items, emptyEdu()] });
  const remove = (id: string) => updateProfile({ education: items.filter((e) => e.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Education</h2>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No education added yet. Click &quot;Add&quot; to begin.</p>
      )}

      {items.map((edu) => (
        <div key={edu.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-end">
            <button onClick={() => remove(edu.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Degree</label>
              <input value={edu.degree} onChange={(e) => update(edu.id, 'degree', e.target.value)} placeholder="B.Tech in Computer Science" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Institution</label>
              <input value={edu.institution} onChange={(e) => update(edu.id, 'institution', e.target.value)} placeholder="University Name" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={edu.location} onChange={(e) => update(edu.id, 'location', e.target.value)} placeholder="City, Country" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CGPA</label>
              <input value={edu.cgpa} onChange={(e) => update(edu.id, 'cgpa', e.target.value)} placeholder="8.5/10" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Year</label>
              <input value={edu.startYear} onChange={(e) => update(edu.id, 'startYear', e.target.value)} placeholder="2020" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Year</label>
              <input value={edu.endYear} onChange={(e) => update(edu.id, 'endYear', e.target.value)} placeholder="2024" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
