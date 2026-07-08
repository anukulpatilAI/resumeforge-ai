'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResumeStore } from '@/store/resume.store';
import { Plus, FileText, Copy, Trash2, Loader2 } from 'lucide-react';

export default function ResumesPage() {
  const router = useRouter();
  const { resumes, isLoading, fetchResumes, createResume, deleteResume, duplicateResume } = useResumeStore();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleCreate = async () => {
    const resume = await createResume();
    if (resume) router.push(`/dashboard/resumes/${resume.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Resumes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Create and manage your resumes</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" /> New Resume
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-12 w-12 text-[var(--muted-foreground)] mb-4" />
          <h2 className="text-lg font-semibold">No resumes yet</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Create your first resume to get started</p>
          <button onClick={handleCreate} className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]">
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <div key={r.id} className="group relative rounded-xl border border-[var(--border)] p-5 hover:shadow-md transition-shadow">
              <Link href={`/dashboard/resumes/${r.id}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-[var(--primary)]/10 p-2">
                    <FileText className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{r.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {r.status} &middot; v{r.currentVersion}
                    </p>
                  </div>
                </div>
                {r.targetRole && (
                  <p className="text-sm text-[var(--muted-foreground)] truncate">{r.targetRole}</p>
                )}
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Updated {new Date(r.updatedAt).toLocaleDateString()}
                </p>
              </Link>
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => duplicateResume(r.id)} className="rounded p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" title="Duplicate">
                  <Copy className="h-4 w-4" />
                </button>
                <button onClick={() => { if (confirm('Delete this resume?')) deleteResume(r.id); }} className="rounded p-1 text-[var(--muted-foreground)] hover:text-red-500" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
