import { create } from 'zustand';
import { api } from '@/lib/api';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  photoUrl: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  cgpa: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  techStack: string[];
  responsibilities: string[];
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: string;
}

export interface ProfileData {
  personalInfo: PersonalInfo;
  education: Education[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  summary: string;
}

const defaultProfile: ProfileData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', photoUrl: '' },
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  languages: [],
  summary: '',
};

interface ProfileState {
  profile: ProfileData;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => void;
  saveProfile: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: defaultProfile,
  isLoading: true,
  isSaving: false,
  lastSaved: null,

  loadProfile: async () => {
    try {
      const data = await api.get<{ userId: string; profile: ProfileData }>('/career-profile');
      set({ profile: data.profile || defaultProfile, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: (data) => {
    const current = get().profile;
    const updated: ProfileData = {
      personalInfo: { ...current.personalInfo, ...(data.personalInfo || {}) },
      education: data.education ?? current.education,
      skills: data.skills ?? current.skills,
      experience: data.experience ?? current.experience,
      projects: data.projects ?? current.projects,
      certifications: data.certifications ?? current.certifications,
      languages: data.languages ?? current.languages,
      summary: data.summary ?? current.summary,
    };
    set({ profile: updated });
  },

  saveProfile: async () => {
    set({ isSaving: true });
    try {
      const data = await api.put<{ userId: string; profile: ProfileData }>('/career-profile', get().profile);
      set({ profile: data.profile, lastSaved: new Date(), isSaving: false });
    } catch {
      set({ isSaving: false });
    }
  },
}));
