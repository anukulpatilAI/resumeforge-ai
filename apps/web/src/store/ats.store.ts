import { create } from 'zustand';
import { api } from '@/lib/api';

function safeClone<T>(obj: T): T {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  }));
}

export interface AtsSuggestion {
  category: 'keywords' | 'formatting' | 'readability' | 'length' | 'impact';
  severity: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  section?: string;
}

export interface AtsResult {
  overallScore: number;
  keywordScore: number;
  formattingScore: number;
  readabilityScore: number;
  lengthScore: number;
  redFlagScore: number;
  skillsAuditScore: number;
  achievementScore: number;
  careerScore: number;
  biasScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AtsSuggestion[];
}

export interface JdKeywordItem {
  keyword: string;
  category: 'hard-skill' | 'soft-skill' | 'certification' | 'education' | 'experience';
  required: boolean;
  inResume: boolean;
}

export interface JdDensityItem {
  keyword: string;
  found: number;
  optimalMin: number;
  optimalMax: number;
  status: 'low' | 'good' | 'high';
}

export interface JdMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: JdKeywordItem[];
  keywordDensity: JdDensityItem[];
  suggestions: string[];
}

interface AtsState {
  result: AtsResult | null;
  jdResult: JdMatchResult | null;
  isAnalyzing: boolean;
  isApplying: boolean;
  isMatching: boolean;
  isRewriting: boolean;
  error: string | null;
  analyze: (resumeId: string, sections: any, targetRole?: string) => Promise<void>;
  applySuggestion: (sections: any, suggestionType: string, suggestionSection?: string, value?: string) => Promise<any>;
  matchWithJd: (sections: any, jobDescription: string, targetRole?: string) => Promise<void>;
  aiRewrite: (suggestionType: string, sections: any, targetRole?: string) => Promise<any>;
  clear: () => void;
}

export const useAtsStore = create<AtsState>((set) => ({
  result: null,
  jdResult: null,
  isAnalyzing: false,
  isApplying: false,
  isMatching: false,
  isRewriting: false,
  error: null,

  analyze: async (resumeId, sections, targetRole) => {
    set({ isAnalyzing: true, error: null });
    try {
      const safe = safeClone(sections);
      const result = await api.post<AtsResult>('/ats/analyze', { resumeId, sections: safe, targetRole });
      set({ result, isAnalyzing: false });
    } catch (err: any) {
      set({ error: err.message || 'Analysis failed', isAnalyzing: false });
    }
  },

  applySuggestion: async (sections, suggestionType, suggestionSection, value) => {
    set({ isApplying: true, error: null });
    try {
      const safe = safeClone(sections);
      const { sections: updated } = await api.post<{ sections: any }>('/ats/apply', {
        sections: safe, suggestionType, suggestionSection, value,
      });
      set({ isApplying: false });
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Apply failed', isApplying: false });
      return null;
    }
  },

  matchWithJd: async (sections, jobDescription, targetRole) => {
    set({ isMatching: true, error: null });
    try {
      const safe = safeClone(sections);
      const result = await api.post<JdMatchResult>('/ats/match-jd', { sections: safe, jobDescription, targetRole });
      set({ jdResult: result, isMatching: false });
    } catch (err: any) {
      set({ error: err.message || 'JD match failed', isMatching: false });
    }
  },

  aiRewrite: async (suggestionType, sections, targetRole) => {
    set({ isRewriting: true, error: null });
    try {
      const safe = safeClone(sections);
      const result = await api.post('/ats/rewrite', { suggestionType, sections: safe, targetRole });
      set({ isRewriting: false });
      return result;
    } catch (err: any) {
      set({ error: err.message || 'AI rewrite failed', isRewriting: false });
      return null;
    }
  },

  clear: () => set({ result: null, jdResult: null, error: null }),
}));
