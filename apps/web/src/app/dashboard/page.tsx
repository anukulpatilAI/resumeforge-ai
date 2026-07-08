'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { FileText, Target, Sparkles, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Resumes Created', value: '0', icon: FileText, color: 'text-blue-500' },
  { label: 'ATS Score Avg', value: '--', icon: TrendingUp, color: 'text-green-500' },
  { label: 'AI Generations', value: '0', icon: Sparkles, color: 'text-purple-500' },
  { label: 'Profile Completeness', value: '0%', icon: Target, color: 'text-orange-500' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.fullName}</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">Here&apos;s an overview of your resume building journey</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-[var(--border)] p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border)] p-6 sm:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Ready to build your resume?</h2>
        <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-6">Create your first resume in minutes with AI assistance</p>
        <button
          onClick={() => router.push('/dashboard/resumes')}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          <FileText className="h-5 w-5" />
          Create Resume
        </button>
      </div>
    </div>
  );
}
