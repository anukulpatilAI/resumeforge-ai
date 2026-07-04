'use client';

import { useProfileStore } from '@/store/profile.store';

export default function SummaryStep() {
  const { profile, updateProfile } = useProfileStore();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Professional Summary</h2>
      <p className="text-sm text-[var(--muted-foreground)]">
        Write a brief summary of your professional background, key skills, and career goals.
      </p>
      <textarea
        value={profile.summary}
        onChange={(e) => updateProfile({ summary: e.target.value })}
        rows={6}
        placeholder="Results-oriented software engineer with 5+ years of experience building scalable web applications..."
        className="w-full rounded-lg border border-[var(--border)] bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
      />
      <div className="flex justify-end">
        <span className="text-xs text-[var(--muted-foreground)]">{profile.summary.length} characters</span>
      </div>
    </div>
  );
}
