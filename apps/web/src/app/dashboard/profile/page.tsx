'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useProfileStore } from '@/store/profile.store';
import PersonalInfoStep from '@/components/career-profile/personal-info-step';
import EducationStep from '@/components/career-profile/education-step';
import SkillsStep from '@/components/career-profile/skills-step';
import ExperienceStep from '@/components/career-profile/experience-step';
import ProjectsStep from '@/components/career-profile/projects-step';
import SummaryStep from '@/components/career-profile/summary-step';
import CertificationStep from '@/components/career-profile/certification-step';
import LanguageStep from '@/components/career-profile/language-step';
import { Check, Loader2 } from 'lucide-react';

const steps = [
  { label: 'Personal', component: PersonalInfoStep },
  { label: 'Education', component: EducationStep },
  { label: 'Skills', component: SkillsStep },
  { label: 'Experience', component: ExperienceStep },
  { label: 'Projects', component: ProjectsStep },
  { label: 'Certifications', component: CertificationStep },
  { label: 'Languages', component: LanguageStep },
  { label: 'Summary', component: SummaryStep },
];

export default function ProfilePage() {
  const { profile, isLoading, isSaving, lastSaved, loadProfile, saveProfile } = useProfileStore();
  const [step, setStep] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevProfileRef = useRef(profile);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    prevProfileRef.current = profile;
  });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (JSON.stringify(prevProfileRef.current) !== JSON.stringify(profile)) {
        saveProfile();
      }
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [profile, saveProfile]);

  const StepComponent = steps[step].component;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Career Profile</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Your master data — used across all resumes</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isSaving ? (
            <span className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-[var(--border)] p-1 overflow-x-auto">
        {steps.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              i === step
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] p-6">
        <StepComponent />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="rounded-lg border border-[var(--border)] px-6 py-2 text-sm font-medium hover:bg-[var(--muted)] disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
