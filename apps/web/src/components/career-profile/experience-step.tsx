'use client';

import { useProfileStore } from '@/store/profile.store';
import { Plus, Trash2 } from 'lucide-react';

function emptyExp() {
  return {
    id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: '',
    isCurrent: false, techStack: [], responsibilities: [], achievements: [],
  };
}

export default function ExperienceStep() {
  const { profile, updateProfile } = useProfileStore();
  const items = profile.experience;

  const update = (id: string, field: string, value: any) => {
    updateProfile({ experience: items.map((e) => (e.id === id ? { ...e, [field]: value } : e)) });
  };

  const add = () => updateProfile({ experience: [...items, emptyExp()] });
  const remove = (id: string) => updateProfile({ experience: items.filter((e) => e.id !== id) });

  const addListItem = (id: string, field: 'techStack' | 'responsibilities' | 'achievements', value: string) => {
    if (!value.trim()) return;
    const item = items.find((e) => e.id === id);
    if (item) update(id, field, [...item[field], value.trim()]);
  };

  const removeListItem = (id: string, field: 'techStack' | 'responsibilities' | 'achievements', index: number) => {
    const item = items.find((e) => e.id === id);
    if (item) update(id, field, item[field].filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Experience</h2>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No experience added yet.</p>
      )}

      {items.map((exp) => (
        <div key={exp.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-end">
            <button onClick={() => remove(exp.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input value={exp.company} onChange={(e) => update(exp.id, 'company', e.target.value)} placeholder="Company Name" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <input value={exp.role} onChange={(e) => update(exp.id, 'role', e.target.value)} placeholder="Software Engineer" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={exp.location} onChange={(e) => update(exp.id, 'location', e.target.value)} placeholder="City, Country" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input value={exp.startDate} onChange={(e) => update(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input value={exp.endDate} onChange={(e) => update(exp.id, 'endDate', e.target.value)} placeholder="Present" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" disabled={exp.isCurrent} />
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={exp.isCurrent} onChange={(e) => update(exp.id, 'isCurrent', e.target.checked)} className="rounded border-[var(--border)]" />
            I currently work here
          </label>

          <ListField label="Tech Stack" items={exp.techStack} onAdd={(v) => addListItem(exp.id, 'techStack', v)} onRemove={(i) => removeListItem(exp.id, 'techStack', i)} placeholder="e.g. React, Node.js" />
          <ListField label="Responsibilities" items={exp.responsibilities} onAdd={(v) => addListItem(exp.id, 'responsibilities', v)} onRemove={(i) => removeListItem(exp.id, 'responsibilities', i)} placeholder="e.g. Led a team of 5 engineers" />
          <ListField label="Achievements" items={exp.achievements} onAdd={(v) => addListItem(exp.id, 'achievements', v)} onRemove={(i) => removeListItem(exp.id, 'achievements', i)} placeholder="e.g. Reduced deployment time by 40%" />
        </div>
      ))}
    </div>
  );
}

function ListField({ label, items, onAdd, onRemove, placeholder }: {
  label: string; items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs">
            {item}
            <button onClick={() => onRemove(i)} className="text-[var(--muted-foreground)] hover:text-red-500">
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
