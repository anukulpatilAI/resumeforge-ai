import { create } from 'zustand';
import { api } from '@/lib/api';

interface AiState {
  loading: Record<string, boolean>;
  results: Record<string, unknown>;
  errors: Record<string, string>;
  generateSummary: (vars: {
    targetRole: string; yearsExperience: string; skills: string; currentRole: string; experience?: string; projects?: string; education?: string; existingSummary?: string; format?: string;
  }) => Promise<Record<string, unknown>>;
  rewriteExperience: (vars: {
    targetRole: string; role: string; company: string; achievements: string[]; format?: string;
  }) => Promise<Record<string, unknown>>;
  generateProject: (vars: {
    projectName: string; domain: string; techStack: string[]; targetRole: string; careerContext?: string; format?: string;
  }) => Promise<Record<string, unknown>>;
  generateAchievements: (vars: {
    targetRole: string; skills: string; role: string; context: string; format?: string;
  }, key: string) => Promise<Record<string, unknown>>;
  clearResult: (key: string) => void;
}

export const useAssistantStore = create<AiState>((set) => ({
  loading: {},
  results: {},
  errors: {},

  generateSummary: async (vars: {
    targetRole: string; yearsExperience: string; skills: string; currentRole: string; experience?: string; projects?: string; education?: string; existingSummary?: string; format?: string;
  }) => {
    const key = 'summary';
    set((s) => ({ loading: { ...s.loading, [key]: true }, errors: { ...s.errors, [key]: '' } }));
    try {
      const result = await api.post<Record<string, unknown>>('/assistant/generate-summary', vars);
      set((s) => ({ results: { ...s.results, [key]: result } }));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate summary';
      set((s) => ({ errors: { ...s.errors, [key]: msg } }));
      return {};
    } finally {
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
    }
  },

  rewriteExperience: async (vars: {
    targetRole: string; role: string; company: string; achievements: string[]; format?: string;
  }) => {
    const key = vars.role;
    set((s) => ({ loading: { ...s.loading, [key]: true }, errors: { ...s.errors, [key]: '' } }));
    try {
      const result = await api.post<Record<string, unknown>>('/assistant/rewrite-experience', vars);
      set((s) => ({ results: { ...s.results, [key]: result } }));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to rewrite experience';
      set((s) => ({ errors: { ...s.errors, [key]: msg } }));
      return {};
    } finally {
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
    }
  },

  generateProject: async (vars: {
    projectName: string; domain: string; techStack: string[]; targetRole: string; careerContext?: string; format?: string;
  }) => {
    const key = vars.projectName;
    set((s) => ({ loading: { ...s.loading, [key]: true }, errors: { ...s.errors, [key]: '' } }));
    try {
      const result = await api.post<Record<string, unknown>>('/assistant/generate-project', vars);
      set((s) => ({ results: { ...s.results, [key]: result } }));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate project';
      set((s) => ({ errors: { ...s.errors, [key]: msg } }));
      return {};
    } finally {
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
    }
  },

  generateAchievements: async (vars: {
    targetRole: string; skills: string; role: string; context: string; format?: string;
  }, key: string) => {
    set((s) => ({ loading: { ...s.loading, [key]: true }, errors: { ...s.errors, [key]: '' } }));
    try {
      const result = await api.post<Record<string, unknown>>('/assistant/generate-achievements', vars);
      set((s) => ({ results: { ...s.results, [key]: result } }));
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate achievements';
      set((s) => ({ errors: { ...s.errors, [key]: msg } }));
      return {};
    } finally {
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
    }
  },

  clearResult: (key) => {
    set((s) => {
      const { [key]: _, ...rest } = s.results;
      const { [key]: __, ...restErrors } = s.errors;
      return { results: rest, errors: restErrors };
    });
  },
}));
