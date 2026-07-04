import { create } from 'zustand';
import { api } from '@/lib/api';
import type { PersonalInfo, Education, Skill, Experience, Project, Certification, Language } from './profile.store';

export type HeaderLayout = 'centered' | 'left' | 'split' | 'banner' | 'compact' | 'sidebar';
export type SkillStyle = 'pill' | 'bar' | 'list' | 'grid';
export type SectionDivider = 'line' | 'space' | 'dot' | 'none';

export interface ColorScheme {
  primary: string;
  background: string;
  text: string;
  accent: string;
  sidebar?: string;
  sidebarText?: string;
  banner?: string;
  bannerText?: string;
}

export interface ColorOption {
  name: string;
  colors: ColorScheme;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  previewImage: string | null;
  templateJson: {
    fonts: { heading: string; body: string };
    colors: ColorScheme;
    spacing: { sectionGap: number; itemGap: number; marginX: number; marginY: number };
    layout: string;
    showPhoto: boolean;
    photoStyle: string;
    sectionStyle: string;
    headerLayout: HeaderLayout;
    photoPosition?: 'left' | 'right';
    skillStyle: SkillStyle;
    sectionDivider: SectionDivider;
    bannerBackground?: string;
    bannerTextColor?: string;
    colorOptions?: ColorOption[];
  };
}

export interface ResumeSection {
  visible: boolean;
  data?: PersonalInfo;
  text?: string;
  items?: (Education | Skill | Experience | Project | Certification | Language)[];
}

export interface ResumeData {
  id: string;
  title: string;
  targetRole: string | null;
  experienceLevel: string | null;
  industry: string | null;
  status: string;
  currentVersion: number;
  template: Template | null;
  versions: ResumeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  version: number;
  resumeJson: {
    templateId: string | null;
    sections: Record<string, ResumeSection>;
    sectionOrder: string[];
    metadata: {
      targetRole: string;
      experienceLevel: string;
      industry: string;
      selectedColorScheme?: string;
    };
  };
  createdAt: string;
}

interface ResumeState {
  resumes: ResumeData[];
  currentResume: (ResumeData & { versions: ResumeVersion[] }) | null;
  isLoading: boolean;
  isSaving: boolean;
  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<void>;
  createResume: (data?: { title?: string; targetRole?: string }) => Promise<ResumeData | null>;
  updateResume: (id: string, data: Partial<ResumeData & { sections?: any; metadata?: any; sectionOrder?: string[]; templateId?: string }>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  restoreVersion: (id: string, version: number) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  isLoading: false,
  isSaving: false,

  fetchResumes: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<ResumeData[]>('/resumes');
      set({ resumes: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchResume: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await api.get<ResumeData & { versions: ResumeVersion[] }>(`/resumes/${id}`);
      set({ currentResume: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createResume: async (data) => {
    try {
      const resume = await api.post<ResumeData>('/resumes', data || {});
      set((s) => ({ resumes: [resume, ...s.resumes] }));
      return resume;
    } catch {
      return null;
    }
  },

  updateResume: async (id, data) => {
    set({ isSaving: true });
    try {
      const updated = await api.put<ResumeData & { versions: ResumeVersion[] }>(`/resumes/${id}`, data);
      set({ currentResume: updated, isSaving: false });
    } catch {
      set({ isSaving: false });
    }
  },

  deleteResume: async (id) => {
    await api.delete(`/resumes/${id}`);
    set((s) => ({ resumes: s.resumes.filter((r) => r.id !== id) }));
  },

  duplicateResume: async (id) => {
    const copy = await api.post<ResumeData>(`/resumes/${id}/duplicate`);
    set((s) => ({ resumes: [copy, ...s.resumes] }));
  },

  restoreVersion: async (id, version) => {
    set({ isSaving: true });
    try {
      const data = await api.post<ResumeData & { versions: ResumeVersion[] }>(`/resumes/${id}/restore/${version}`);
      set({ currentResume: data, isSaving: false });
    } catch {
      set({ isSaving: false });
    }
  },
}));
