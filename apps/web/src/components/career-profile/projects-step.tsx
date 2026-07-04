'use client';

import { useProfileStore } from '@/store/profile.store';
import { Plus, Trash2 } from 'lucide-react';

function emptyProject() {
  return { id: crypto.randomUUID(), name: '', domain: '', description: '', techStack: [], githubUrl: '', liveUrl: '', startDate: '', endDate: '' };
}

export default function ProjectsStep() {
  const { profile, updateProfile } = useProfileStore();
  const items = profile.projects;

  const update = (id: string, field: string, value: any) => {
    updateProfile({ projects: items.map((p) => (p.id === id ? { ...p, [field]: value } : p)) });
  };

  const add = () => updateProfile({ projects: [...items, emptyProject()] });
  const remove = (id: string) => updateProfile({ projects: items.filter((p) => p.id !== id) });

  const addTech = (id: string, value: string) => {
    if (!value.trim()) return;
    const item = items.find((p) => p.id === id);
    if (item) update(id, 'techStack', [...item.techStack, value.trim()]);
  };

  const removeTech = (id: string, index: number) => {
    const item = items.find((p) => p.id === id);
    if (item) update(id, 'techStack', item.techStack.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No projects added yet.</p>
      )}

      {items.map((proj) => (
        <div key={proj.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-end">
            <button onClick={() => remove(proj.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input value={proj.name} onChange={(e) => update(proj.id, 'name', e.target.value)} placeholder="ResumeForge AI" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input value={proj.domain} onChange={(e) => update(proj.id, 'domain', e.target.value)} placeholder="Web Development, AI, etc." className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={proj.description} onChange={(e) => update(proj.id, 'description', e.target.value)} rows={3} placeholder="Describe the project, your role, and impact" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input value={proj.githubUrl} onChange={(e) => update(proj.id, 'githubUrl', e.target.value)} placeholder="https://github.com/..." className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Live URL</label>
              <input value={proj.liveUrl} onChange={(e) => update(proj.id, 'liveUrl', e.target.value)} placeholder="https://..." className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input
                placeholder="e.g. React, Node.js, PostgreSQL"
                className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(proj.id, (e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {proj.techStack.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-0.5 text-xs">
                  {t}
                  <button onClick={() => removeTech(proj.id, i)} className="text-[var(--muted-foreground)] hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
