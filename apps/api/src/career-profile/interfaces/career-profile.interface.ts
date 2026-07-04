export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  photoUrl?: string;
}

export interface Education {
  id?: string;
  degree?: string;
  institution?: string;
  location?: string;
  startYear?: string;
  endYear?: string;
  cgpa?: string;
}

export interface Skill {
  id?: string;
  name?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Experience {
  id?: string;
  company?: string;
  role?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  techStack?: string[];
  responsibilities?: string[];
  achievements?: string[];
}

export interface Project {
  id?: string;
  name?: string;
  domain?: string;
  description?: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id?: string;
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface Language {
  id?: string;
  name?: string;
  proficiency?: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export interface Achievement {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
}

export interface CareerProfileData {
  personalInfo: PersonalInfo;
  education: Education[];
  skills: Skill[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  achievements: Achievement[];
  summary?: string;
}
