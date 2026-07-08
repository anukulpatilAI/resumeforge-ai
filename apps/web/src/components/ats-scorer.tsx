import React, { useState, useEffect } from 'react';
import { useAtsStore, type AtsSuggestion, type JdKeywordItem, type JdDensityItem, type JdMatchResult } from '@/store/ats.store';
import { Loader2, AlertTriangle, CheckCircle, Lightbulb, TrendingUp, FileText, AlignLeft, Maximize, Briefcase, Search, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const scoreColor = (s: number) =>
  s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';

function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = scoreColor(value);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}</span>
        <span className="text-xs text-[var(--muted-foreground)]">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 text-[var(--muted-foreground)]">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{label}</span>
          <span style={{ color }} className="font-bold">{score}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

const severityConfig = {
  high: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: AlertTriangle },
  medium: { bg: '#fffbeb', border: '#fde68a', text: '#d97706', icon: AlertTriangle },
  low: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: CheckCircle },
};

interface AtsScorerProps {
  resumeId: string;
  sections: Record<string, any>;
  targetRole?: string;
  onSectionsUpdate?: (sections: Record<string, any>) => void;
}

function getRewriteType(suggestion: AtsSuggestion): string | null {
  const section = suggestion.section?.toLowerCase() || '';
  if (section === 'summary') return 'rewrite-summary';
  if (section === 'experience') return 'rewrite-experience';
  if (section === 'projects') return 'rewrite-project';
  return null;
}

function getApplyAction(suggestion: AtsSuggestion): { type: string; section?: string; value?: string } | null {
  const msg = suggestion.message.toLowerCase();
  const action = suggestion.action?.toLowerCase() || '';

  if (msg.includes('non-standard name') && suggestion.section) {
    const match = suggestion.action?.match(/Rename "(.+)" to "(.+)"/i);
    if (match) {
      return { type: 'rename-section', section: suggestion.section, value: match[2].toLowerCase().replace(/\s+/g, '-') };
    }
  }

  if (msg.includes('inconsistent date formats') || action.includes('standardize all dates')) {
    return { type: 'fix-dates' };
  }

  if (msg.includes('missing contact') || msg.includes('contact information')) {
    return { type: 'personal-info' };
  }

  if (msg.includes('generic phrase') || msg.includes('filler') || action.includes('remove') && (msg.includes('fast learner') || msg.includes('team player'))) {
    return { type: 'fix-filler' };
  }

  if (msg.includes('overused buzzword') || msg.includes('buzzword')) {
    return { type: 'fix-buzzword' };
  }

  if (msg.includes('ambiguous phrase') || action.includes('rewrite to show your specific role')) {
    return { type: 'fix-ambiguous' };
  }

  return null;
}

export function AtsScorer({ resumeId, sections, targetRole, onSectionsUpdate }: AtsScorerProps) {
  const { result, jdResult, isAnalyzing, isApplying, isMatching, isRewriting, error, analyze, applySuggestion, matchWithJd, aiRewrite, clear } = useAtsStore();
  const [view, setView] = useState<'ats' | 'jd'>('ats');
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [jdText, setJdText] = useState('');
  const [jdExpanded, setJdExpanded] = useState<Record<string, boolean>>({});

  const handleAnalyze = (modifiedSections?: Record<string, any>) => {
    analyze(resumeId, modifiedSections || sections, targetRole);
  };

  const handleAiRewrite = async (suggestion: AtsSuggestion) => {
    const rewriteType = getRewriteType(suggestion);
    if (!rewriteType) return;
    setRewriteResult(null);
    const result = await aiRewrite(rewriteType, sections, targetRole);
    if (result) setRewriteResult(result);
  };

  const handleApply = async (suggestion: AtsSuggestion) => {
    const applyAction = getApplyAction(suggestion);
    if (!applyAction) return;

    const updated = await applySuggestion(sections, applyAction.type, applyAction.section, applyAction.value);
    if (updated) {
      if (onSectionsUpdate) onSectionsUpdate(updated);
      handleAnalyze(updated);
    }
  };

  const handleJdMatch = () => {
    if (!jdText.trim()) return;
    matchWithJd(sections, jdText, targetRole);
  };

  const toggleExpand = (key: string) => {
    setJdExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    keywords: <TrendingUp className="h-4 w-4" />,
    formatting: <FileText className="h-4 w-4" />,
    readability: <AlignLeft className="h-4 w-4" />,
    length: <Maximize className="h-4 w-4" />,
    impact: <Lightbulb className="h-4 w-4" />,
  };

  if (error) {
    return (
      <div className="text-sm text-red-500 p-4 text-center">
        <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
        {error}
        <button onClick={clear} className="mt-2 text-xs underline block mx-auto">Dismiss</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
        <button
          onClick={() => setView('ats')}
          className={`flex-1 py-2 font-medium transition-colors ${view === 'ats' ? 'bg-[var(--primary)] text-white' : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          ATS Analysis
        </button>
        <button
          onClick={() => setView('jd')}
          className={`flex-1 py-2 font-medium transition-colors ${view === 'jd' ? 'bg-[var(--primary)] text-white' : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          <Search className="h-3.5 w-3.5 inline mr-1.5" />
          JD Match
        </button>
      </div>

      {/* ATS Analysis View */}
      {view === 'ats' && (
        <>
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <span className="text-sm text-[var(--muted-foreground)]">Analyzing your resume...</span>
            </div>
          ) : !result ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Run an ATS analysis to see how your resume scores</p>
              <button onClick={() => handleAnalyze()} className="rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90">
                Analyze Resume
              </button>
            </div>
          ) : (
            <AtsResults
              result={result}
              handleAnalyze={handleAnalyze}
              handleApply={handleApply}
              handleAiRewrite={handleAiRewrite}
              isApplying={isApplying}
              isRewriting={isRewriting}
              rewriteResult={rewriteResult}
              onClearRewrite={() => setRewriteResult(null)}
              categoryIcons={categoryIcons}
            />
          )}
        </>
      )}

      {/* JD Match View */}
      {view === 'jd' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Paste the job description you&apos;re targeting</label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description here..."
              rows={6}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent p-3 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <button
              onClick={handleJdMatch}
              disabled={isMatching || !jdText.trim()}
              className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isMatching ? (
                <><Loader2 className="h-3.5 w-3.5 inline animate-spin mr-1.5" />Matching...</>
              ) : (
                <><Search className="h-3.5 w-3.5 inline mr-1.5" />Match with Job Description</>
              )}
            </button>
          </div>

          {jdResult && <JdMatchResults jdResult={jdResult} expanded={jdExpanded} toggleExpand={toggleExpand} />}
        </>
      )}
    </div>
  );
}

function AtsResults({ result, handleAnalyze, handleApply, handleAiRewrite, isApplying, isRewriting, rewriteResult, onClearRewrite, categoryIcons }: {
  result: any;
  handleAnalyze: (modified?: any) => void;
  handleApply: (s: AtsSuggestion) => void;
  handleAiRewrite: (s: AtsSuggestion) => void;
  isApplying: boolean;
  isRewriting: boolean;
  rewriteResult: any;
  onClearRewrite: () => void;
  categoryIcons: Record<string, React.ReactNode>;
}) {
  const highPri = result.suggestions.filter((s: AtsSuggestion) => s.severity === 'high');
  const medPri = result.suggestions.filter((s: AtsSuggestion) => s.severity === 'medium');
  const lowPri = result.suggestions.filter((s: AtsSuggestion) => s.severity === 'low');

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center py-4">
        <ScoreRing value={result.overallScore} size={130} />
        <span className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
          {result.overallScore >= 80 ? 'Great! Ready to apply' : result.overallScore >= 60 ? 'Getting there' : 'Needs improvement'}
        </span>
        <button onClick={() => handleAnalyze()} className="mt-3 text-xs text-[var(--primary)] hover:underline">Re-analyze</button>
      </div>

      <div className="space-y-3 px-1">
        <ScoreBar label="Keywords" score={result.keywordScore} icon={<TrendingUp className="h-4 w-4" />} />
        <ScoreBar label="Formatting" score={result.formattingScore} icon={<FileText className="h-4 w-4" />} />
        <ScoreBar label="Readability" score={result.readabilityScore} icon={<AlignLeft className="h-4 w-4" />} />
        <ScoreBar label="Length" score={result.lengthScore} icon={<Maximize className="h-4 w-4" />} />
        <ScoreBar label="Red Flags" score={result.redFlagScore} icon={<AlertTriangle className="h-4 w-4" />} />
        <ScoreBar label="Skills Audit" score={result.skillsAuditScore} icon={<CheckCircle className="h-4 w-4" />} />
        <ScoreBar label="Achievements" score={result.achievementScore} icon={<Lightbulb className="h-4 w-4" />} />
        <ScoreBar label="Career Progression" score={result.careerScore} icon={<TrendingUp className="h-4 w-4" />} />
        <ScoreBar label="Bias Detection" score={result.biasScore} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="rounded-lg border border-[var(--border)] p-3">
        <p className="text-xs font-medium mb-2">Universal Keywords</p>
        <p className="text-xs text-[var(--muted-foreground)]">{result.matchedKeywords.length} matched · {result.missingKeywords.length} missing</p>
        {result.missingKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {result.missingKeywords.slice(0, 8).map((kw: string) => (
              <span key={kw} className="rounded bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 text-[10px] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">{kw}</span>
            ))}
            {result.missingKeywords.length > 8 && <span className="text-[10px] text-[var(--muted-foreground)]">+{result.missingKeywords.length - 8} more</span>}
          </div>
        )}
      </div>

      {rewriteResult && (
        <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Rewrite Result
            </p>
            <button onClick={onClearRewrite} className="text-purple-400 hover:text-purple-600">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="text-xs text-[var(--foreground)] space-y-1">
            {rewriteResult.summary && <p>{rewriteResult.summary}</p>}
            {rewriteResult.description && <p>{rewriteResult.description}</p>}
            {rewriteResult.bulletPoints?.map((bp: string, i: number) => (
              <p key={i} className="flex gap-1"><span className="text-purple-400">•</span>{bp}</p>
            ))}
            {rewriteResult.achievements?.map((a: string, i: number) => (
              <p key={i} className="flex gap-1"><span className="text-purple-400">•</span>{a}</p>
            ))}
            {rewriteResult.text && <p>{rewriteResult.text}</p>}
            {!rewriteResult.summary && !rewriteResult.description && !rewriteResult.bulletPoints && !rewriteResult.achievements && !rewriteResult.text && (
              <p className="text-[var(--muted-foreground)]">No rewrite content available.</p>
            )}
          </div>
        </div>
      )}

      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Suggestions</p>
            <div className="flex gap-2 text-[10px]">
              {highPri.length > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{highPri.length} high</span>}
              {medPri.length > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{medPri.length} med</span>}
              {lowPri.length > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{lowPri.length} low</span>}
            </div>
          </div>
          {highPri.length > 0 && medPri.length + lowPri.length > 0 && (
            <div className="flex h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 transition-all" style={{ width: `${(highPri.length / result.suggestions.length) * 100}%` }} />
              <div className="bg-amber-500 transition-all" style={{ width: `${(medPri.length / result.suggestions.length) * 100}%` }} />
              <div className="bg-green-500 transition-all" style={{ width: `${(lowPri.length / result.suggestions.length) * 100}%` }} />
            </div>
          )}
          {highPri.map((s: AtsSuggestion, i: number) => {
            const cfg = severityConfig[s.severity];
            const Icon = cfg.icon;
            const applyAction = getApplyAction(s);
            return (
              <div key={i} className="rounded-lg p-3 text-xs" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 shrink-0 mt-0.5" style={{ color: cfg.text }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ color: cfg.text }}>{s.message}</p>
                    {s.action && <p className="mt-1" style={{ color: `${cfg.text}aa` }}>{s.action}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      {s.section && <span className="rounded px-1.5 py-0.5 text-[10px] font-medium capitalize" style={{ background: `${cfg.text}15`, color: cfg.text }}>{s.section}</span>}
                      <div className="flex gap-1.5">
                        {applyAction && (
                          <button onClick={() => handleApply(s)} disabled={isApplying}
                            className="rounded px-2 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: cfg.text, color: '#fff' }}>
                            {isApplying ? 'Applying...' : 'Apply Fix'}
                          </button>
                        )}
                        {getRewriteType(s) && (
                          <button onClick={() => handleAiRewrite(s)} disabled={isRewriting}
                            className="rounded px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: `${cfg.text}15`, color: cfg.text }}>
                            <Sparkles className="h-3 w-3" />
                            {isRewriting ? 'Rewriting...' : 'AI Rewrite'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {[...medPri, ...lowPri].map((s: AtsSuggestion, i: number) => {
            const cfg = severityConfig[s.severity];
            const applyAction = getApplyAction(s);
            return (
              <div key={i} className="rounded-lg border border-[var(--border)] p-3 text-xs">
                <div className="flex items-start gap-2">
                  {categoryIcons[s.category] || <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-[var(--muted-foreground)]" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--foreground)]">{s.message}</p>
                    {s.action && <p className="mt-0.5 text-[var(--muted-foreground)]">{s.action}</p>}
                    <div className="flex gap-1.5 mt-1.5">
                      {applyAction && (
                        <button onClick={() => handleApply(s)} disabled={isApplying}
                          className="rounded px-2 py-0.5 text-[10px] font-semibold bg-[var(--primary)] text-white transition-opacity hover:opacity-80 disabled:opacity-50">
                          {isApplying ? 'Applying...' : 'Apply Fix'}
                        </button>
                      )}
                      {getRewriteType(s) && (
                        <button onClick={() => handleAiRewrite(s)} disabled={isRewriting}
                          className="rounded px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 border border-[var(--border)] transition-opacity hover:opacity-80 disabled:opacity-50">
                          <Sparkles className="h-3 w-3" />
                          {isRewriting ? 'Rewriting...' : 'AI Rewrite'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JdMatchResults({ jdResult, expanded, toggleExpand }: {
  jdResult: JdMatchResult;
  expanded: Record<string, boolean>;
  toggleExpand: (key: string) => void;
}) {
  const missingRequired = jdResult.missingKeywords.filter((k) => k.required && !k.inResume);
  const matchedHard = jdResult.missingKeywords.filter((k) => k.category === 'hard-skill' && k.inResume);
  const missingHard = jdResult.missingKeywords.filter((k) => k.category === 'hard-skill' && !k.inResume);
  const missingSoft = jdResult.missingKeywords.filter((k) => k.category === 'soft-skill' && !k.inResume);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-3">
        <ScoreRing value={jdResult.matchScore} size={120} />
        <span className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
          {jdResult.matchScore >= 75 ? 'Strong match!' : jdResult.matchScore >= 50 ? 'Moderate match' : 'Needs improvement'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-2.5 text-center">
          <p className="font-bold text-green-600 dark:text-green-400 text-lg">{matchedHard.length}</p>
          <p className="text-[10px] text-green-600/70 dark:text-green-400/70">Skills Matched</p>
        </div>
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-2.5 text-center">
          <p className="font-bold text-red-600 dark:text-red-400 text-lg">{missingRequired.length}</p>
          <p className="text-[10px] text-red-600/70 dark:text-red-400/70">Required Missing</p>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 p-3">
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Required — Add These</p>
          <div className="flex flex-wrap gap-1">
            {missingRequired.slice(0, 12).map((k) => (
              <span key={k.keyword} className="rounded bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 text-[10px] text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">{k.keyword}</span>
            ))}
          </div>
        </div>
      )}

      {missingSoft.length > 0 && (
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 p-3">
          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">Preferred — Consider Adding</p>
          <div className="flex flex-wrap gap-1">
            {missingSoft.slice(0, 8).map((k) => (
              <span key={k.keyword} className="rounded bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 text-[10px] text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">{k.keyword}</span>
            ))}
          </div>
        </div>
      )}

      {jdResult.keywordDensity.length > 0 && (
        <div>
          <button onClick={() => toggleExpand('density')} className="flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] w-full text-left">
            {expanded['density'] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Keyword Density ({jdResult.keywordDensity.length})
          </button>
          {expanded['density'] && (
            <div className="mt-2 space-y-1">
              {jdResult.keywordDensity.slice(0, 10).map((d) => (
                <div key={d.keyword} className="flex items-center gap-2 text-[10px]">
                  <span className="flex-1 truncate">{d.keyword}</span>
                  <span className={`font-medium ${d.status === 'good' ? 'text-green-500' : d.status === 'high' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {d.found}x
                  </span>
                  <span className="text-[var(--muted-foreground)]">({d.optimalMin}-{d.optimalMax}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {jdResult.suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Suggestions</p>
          {jdResult.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-[var(--border)] p-2.5 text-xs">
              <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-yellow-500" />
              <p className="text-[var(--foreground)]">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
