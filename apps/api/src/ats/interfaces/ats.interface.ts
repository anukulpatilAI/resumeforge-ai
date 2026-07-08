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

export interface AtsSuggestion {
  category: 'keywords' | 'formatting' | 'readability' | 'length' | 'impact';
  severity: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  section?: string;
}

export interface SectionData {
  visible?: boolean;
  text?: string;
  format?: string;
  data?: Record<string, unknown>;
  items?: Record<string, unknown>[];
}

export interface JdMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: JdKeywordItem[];
  keywordDensity: JdDensityItem[];
  suggestions: string[];
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
