'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useAssistantStore } from '@/store/assistant.store';

interface AiAssistantProps {
  resumeData: {
    targetRole?: string;
    yearsExperience?: string;
    skills?: string[];
    roles?: Array<{ role: string; company: string; achievements: string[] }>;
    projects?: Array<{ name: string; domain: string; techStack: string[] }>;
    existingSummary?: string;
  };
  onApplySummary: (text: string, format?: 'paragraph' | 'bulletPoints') => void;
  onApplyExperience: (roleIdx: number, achievements: string[]) => void;
  onApplyProject: (projIdx: number, description: string) => void;
}

type FormatMode = 'paragraph' | 'bulletPoints';

export function AiAssistant({ resumeData, onApplySummary, onApplyExperience, onApplyProject }: AiAssistantProps) {
  const { loading, results, errors, generateSummary, rewriteExperience, generateProject, generateAchievements, clearResult } = useAssistantStore();

  const [formats, setFormats] = useState<Record<string, FormatMode>>({});

  const setFormat = (key: string, fmt: FormatMode) =>
    setFormats((p) => ({ ...p, [key]: fmt }));

  const handleGenerateSummary = async () => {
    const fmt = formats['summary'] || 'paragraph';
    const expText = (resumeData.roles || [])
      .map((r) => `Role: ${r.role} at ${r.company}\nAchievements:\n${r.achievements.map((a) => `- ${a}`).join('\n')}`)
      .join('\n\n');
    const projText = (resumeData.projects || [])
      .map((p) => `Project: ${p.name} (${p.domain})\nTech: ${p.techStack.join(', ')}`)
      .join('\n\n');
    await generateSummary({
      targetRole: resumeData.targetRole || 'Software Engineer',
      yearsExperience: resumeData.yearsExperience || '5+',
      skills: (resumeData.skills || []).join(', '),
      currentRole: resumeData.roles?.[0]?.role || 'Software Engineer',
      experience: expText ? `Experience:\n${expText}` : '',
      projects: projText ? `Projects:\n${projText}` : '',
      format: fmt,
    });
  };

  const handleRewriteSummary = async () => {
    if (!resumeData.existingSummary) return handleGenerateSummary();
    const fmt = formats['summary'] || 'paragraph';
    const expText = (resumeData.roles || [])
      .map((r) => `Role: ${r.role} at ${r.company}\nAchievements:\n${r.achievements.map((a) => `- ${a}`).join('\n')}`)
      .join('\n\n');
    const projText = (resumeData.projects || [])
      .map((p) => `Project: ${p.name} (${p.domain})\nTech: ${p.techStack.join(', ')}`)
      .join('\n\n');
    await generateSummary({
      targetRole: resumeData.targetRole || 'Software Engineer',
      yearsExperience: resumeData.yearsExperience || '5+',
      skills: (resumeData.skills || []).join(', '),
      currentRole: resumeData.roles?.[0]?.role || 'Software Engineer',
      experience: expText ? `Experience:\n${expText}` : '',
      projects: projText ? `Projects:\n${projText}` : '',
      existingSummary: resumeData.existingSummary,
      format: fmt,
    });
  };

  const handleRewriteExperience = async (idx: number) => {
    const exp = resumeData.roles?.[idx];
    if (!exp) return;
    const key = exp.role;
    const fmt = formats[key] || 'bulletPoints';
    await rewriteExperience({
      targetRole: resumeData.targetRole || 'Software Engineer',
      role: exp.role,
      company: exp.company,
      achievements: exp.achievements,
      format: fmt,
    });
  };

  const handleGenerateProject = async (idx: number) => {
    const proj = resumeData.projects?.[idx];
    if (!proj) return;
    const key = proj.name;
    const fmt = formats[key] || 'paragraph';
    const careerContext = (resumeData.roles || [])
      .map((r) => `Role: ${r.role} at ${r.company}\n${r.achievements.map((a) => `- ${a}`).join('\n')}`)
      .join('\n\n');
    await generateProject({
      projectName: proj.name,
      domain: proj.domain,
      techStack: proj.techStack,
      targetRole: resumeData.targetRole || 'Software Engineer',
      careerContext: careerContext || undefined,
      format: fmt,
    });
  };

  const handleGenerateAchievements = async (idx: number) => {
    const exp = resumeData.roles?.[idx];
    if (!exp) return;
    const key = `ach-${idx}`;
    const fmt = formats[key] || 'bulletPoints';
    await generateAchievements({
      targetRole: resumeData.targetRole || 'Software Engineer',
      skills: (resumeData.skills || []).join(', '),
      role: exp.role,
      context: `${exp.company}: ${exp.achievements.join(', ')}`,
      format: fmt,
    }, key);
  };

  const fmtToggle = (key: string, defaultFmt: FormatMode = 'paragraph') => {
    const fmt = formats[key] || defaultFmt;
    return (
      <div className="flex gap-0.5 rounded-md bg-[var(--muted)] p-0.5">
        {(['paragraph', 'bulletPoints'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFormat(key, opt)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              fmt === opt ? 'bg-[var(--background)] shadow-sm' : 'text-[var(--muted-foreground)]'
            }`}
          >
            {opt === 'paragraph' ? 'Aa' : '• •'}
          </button>
        ))}
      </div>
    );
  };

  const renderResult = (key: string) => {
    const result = results[key] as Record<string, unknown> | undefined;
    if (!result) return null;
    const hasBullets = 'bulletPoints' in result || 'achievements' in result;
    const hasParagraph = 'summary' in result || 'description' in result;
    if (hasBullets) {
      const items = (result.bulletPoints || result.achievements || []) as string[];
      return (
        <ul className="list-disc list-inside pr-2 sm:pr-8 space-y-0.5">
          {items.map((bp, i) => <li key={i}>{bp}</li>)}
        </ul>
      );
    }
    if (hasParagraph) {
      const text = (result.summary || result.description || '') as string;
      return <p className="pr-2 sm:pr-8">{text}</p>;
    }
    return null;
  };

  const getResultText = (key: string): string => {
    const result = results[key] as Record<string, unknown> | undefined;
    if (!result) return '';
    const items = (result.bulletPoints || result.achievements) as string[] | undefined;
    if (items) return items.join('\n');
    return (result.summary || result.description || result.text || '') as string;
  };

  const getResultFormat = (key: string): 'paragraph' | 'bulletPoints' => {
    const result = results[key] as Record<string, unknown> | undefined;
    if (!result) return 'paragraph';
    if ('bulletPoints' in result || 'achievements' in result) return 'bulletPoints';
    return 'paragraph';
  };

  const summaryResult = results['summary'] as Record<string, unknown> | undefined;
  const summaryError = errors['summary'];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--primary)]" />
        AI Assistant
      </h3>

      {/* Generate Summary */}
      <div className="rounded-lg border border-[var(--border)] p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs font-medium mr-auto">Professional Summary</span>
          {fmtToggle('summary', 'paragraph')}
          <button
            onClick={handleGenerateSummary}
            disabled={loading['summary']}
            className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline disabled:opacity-50"
          >
            {loading['summary'] ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Generate
          </button>
          {resumeData.existingSummary && (
            <button
              onClick={handleRewriteSummary}
              disabled={loading['summary']}
              className="flex items-center gap-1 text-xs text-amber-600 hover:underline disabled:opacity-50"
            >
              {loading['summary'] ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Rewrite
            </button>
          )}
        </div>
        {summaryError && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {summaryError}
          </div>
        )}
        {summaryResult && (
          <div className="rounded bg-[var(--muted)] p-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">{renderResult('summary')}</div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    const fmt = getResultFormat('summary');
                    onApplySummary(getResultText('summary'), fmt);
                    clearResult('summary');
                  }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                <button onClick={() => clearResult('summary')} className="text-red-500 hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rewrite Experience + Achievements */}
      {resumeData.roles?.map((exp, idx) => {
        const expKey = exp.role;
        const achKey = `ach-${idx}`;
        const expResult = results[expKey] as Record<string, unknown> | undefined;
        const achResult = results[achKey] as Record<string, unknown> | undefined;
        const expError = errors[expKey];
        const achError = errors[achKey];
        return (
          <div key={idx} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium truncate">{exp.role}</span>
            </div>

            {/* Rewrite */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-[var(--muted-foreground)] mr-auto">Rewrite</span>
                {fmtToggle(expKey, 'bulletPoints')}
                <button
                  onClick={() => handleRewriteExperience(idx)}
                  disabled={loading[expKey]}
                  className="flex items-center gap-1 text-[10px] text-[var(--primary)] hover:underline disabled:opacity-50"
                >
                  {loading[expKey] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Rewrite
                </button>
              </div>
              {expError && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {expError}
                </div>
              )}
              {expResult && (
                <div className="rounded bg-[var(--muted)] p-2 text-xs">
                  <p className="text-[10px] font-medium mb-1 text-[var(--muted-foreground)]">Rewritten:</p>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">{renderResult(expKey)}</div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const bp = (expResult.bulletPoints || expResult.achievements) as string[] | undefined;
                          if (bp) { onApplyExperience(idx, bp); clearResult(expKey); return; }
                          const txt = (expResult.summary || expResult.description || expResult.text || '') as string;
                          if (txt.trim()) onApplyExperience(idx, [txt]);
                          clearResult(expKey);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => clearResult(expKey)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-[var(--muted-foreground)] mr-auto">Achievements</span>
                {fmtToggle(achKey, 'bulletPoints')}
                <button
                  onClick={() => handleGenerateAchievements(idx)}
                  disabled={loading[achKey]}
                  className="flex items-center gap-1 text-[10px] text-[var(--primary)] hover:underline disabled:opacity-50"
                >
                  {loading[achKey] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  Generate
                </button>
              </div>
              {achError && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {achError}
                </div>
              )}
              {achResult && (
                <div className="rounded bg-[var(--muted)] p-2 text-xs">
                  <p className="text-[10px] font-medium mb-1 text-[var(--muted-foreground)]">Achievements:</p>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">{renderResult(achKey)}</div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const bp = (achResult.bulletPoints || achResult.achievements) as string[] | undefined;
                          if (bp) { onApplyExperience(idx, bp); clearResult(achKey); return; }
                          const txt = (achResult.summary || achResult.description || achResult.text || '') as string;
                          if (txt.trim()) onApplyExperience(idx, [txt]);
                          clearResult(achKey);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => clearResult(achKey)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Generate Project Description */}
      {resumeData.projects?.map((proj, idx) => {
        const projKey = proj.name;
        const projResult = results[projKey] as Record<string, unknown> | undefined;
        const projError = errors[projKey];
        return (
          <div key={idx} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-medium mr-auto truncate">{proj.name}</span>
              {fmtToggle(projKey, 'paragraph')}
              <button
                onClick={() => handleGenerateProject(idx)}
                disabled={loading[projKey]}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline disabled:opacity-50"
              >
                {loading[projKey] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Generate
              </button>
            </div>
            {projError && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
                {projError}
              </div>
            )}
            {projResult && (
              <div className="rounded bg-[var(--muted)] p-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">{renderResult(projKey)}</div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        const t = getResultText(projKey);
                        if (t.trim()) onApplyProject(idx, t);
                        clearResult(projKey);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => clearResult(projKey)} className="text-red-500 hover:text-red-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
