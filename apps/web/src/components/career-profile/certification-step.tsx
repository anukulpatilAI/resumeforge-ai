'use client';

import { useProfileStore } from '@/store/profile.store';
import { Plus, Trash2 } from 'lucide-react';

function emptyCert() {
  return { id: crypto.randomUUID(), name: '', issuer: '', date: '', url: '' };
}

export default function CertificationStep() {
  const { profile, updateProfile } = useProfileStore();
  const items = profile.certifications;

  const update = (id: string, field: string, value: string) => {
    updateProfile({ certifications: items.map((c) => (c.id === id ? { ...c, [field]: value } : c)) });
  };

  const add = () => updateProfile({ certifications: [...items, emptyCert()] });
  const remove = (id: string) => updateProfile({ certifications: items.filter((c) => c.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <button onClick={add} className="flex items-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">No certifications added yet. Click &quot;Add&quot; to begin.</p>
      )}

      {items.map((cert) => (
        <div key={cert.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
          <div className="flex justify-end">
            <button onClick={() => remove(cert.id)} className="text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Certification Name</label>
              <input value={cert.name} onChange={(e) => update(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issuer</label>
              <input value={cert.issuer} onChange={(e) => update(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input value={cert.date} onChange={(e) => update(cert.id, 'date', e.target.value)} placeholder="2024-06" className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Credential URL (optional)</label>
              <input value={cert.url} onChange={(e) => update(cert.id, 'url', e.target.value)} placeholder="https://credential.example.com/..." className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
