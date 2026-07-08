import type { JdKeywordItem, JdDensityItem } from '../interfaces/ats.interface';

const HARD_SKILLS = [
  'react', 'angular', 'vue', 'node.js', 'node', 'python', 'java', 'go', 'golang', 'rust',
  'typescript', 'javascript', 'c#', 'c++', 'c', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  'perl', 'r', 'matlab', 'dart', 'elixir', 'clojure', 'haskell',
  'docker', 'kubernetes', 'terraform', 'ansible', 'puppet', 'chef', 'jenkins', 'gitlab ci',
  'github actions', 'circleci', 'travis ci', 'argo', 'helm',
  'aws', 'azure', 'gcp', 'google cloud', 'cloud', 'heroku', 'digitalocean', 'cloudflare',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
  'sqlite', 'mariadb', 'oracle', 'sql server', 'db2', 'couchdb', 'neo4j',
  'kafka', 'rabbitmq', 'nats', 'pubsub', 'spark', 'flink', 'hadoop', 'airflow',
  'graphql', 'rest', 'grpc', 'soap', 'websocket',
  'django', 'flask', 'spring', 'spring boot', 'express', 'next.js', 'nuxt', 'laravel',
  'rails', 'asp.net', 'fastapi', 'gin', 'echo',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'jupyter', 'pandas', 'numpy',
  'selenium', 'cypress', 'playwright', 'junit', 'pytest', 'jest', 'mocha', 'chai',
  'git', 'svn', 'mercurial',
  'linux', 'unix', 'bash', 'powershell', 'shell', 'zsh',
  'nginx', 'apache', 'traefik', 'haproxy', 'istio', 'envoy',
  'prometheus', 'grafana', 'datadog', 'new relic', 'sentry', 'jaeger', 'opentelemetry',
  'tableau', 'power bi', 'looker', 'metabase', 'superset',
  'sass', 'scss', 'tailwind', 'bootstrap', 'material ui', 'chakra ui',
  'redux', 'mobx', 'zustand', 'vuex', 'pinia', 'recoil', 'jotai',
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel', 'babel',
  'jest', 'vitest', 'playwright', 'cypress', 'testing library', 'enzyme',
  'storybook', 'chromatic', 'loki',
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'analytical', 'time management', 'project management',
  'stakeholder management', 'cross-functional', 'mentoring', 'agile', 'scrum',
  'kanban', 'waterfall', 'product management', 'strategic thinking',
  'decision making', 'negotiation', 'presentation', 'public speaking',
  'written communication', 'verbal communication', 'interpersonal',
  'conflict resolution', 'adaptability', 'flexibility', 'creativity',
  'innovation', 'ownership', 'accountability', 'self-motivated',
  'detail-oriented', 'organized', 'planning', 'prioritization',
  'customer-facing', 'client management', 'vendor management',
  'budget management', 'resource allocation', 'risk management',
];

const CERTIFICATIONS = [
  'aws certified', 'aws solutions architect', 'aws developer', 'aws devops',
  'azure certified', 'azure administrator', 'azure developer', 'azure architect',
  'gcp certified', 'google cloud certified',
  'pmp', 'csm', 'cspo', 'psm', 'safe', 'prince2', 'six sigma', 'itil',
  'cka', 'ckad', 'cks', 'cissp', 'ceh', 'security+', 'network+',
  'comptia', 'isc2', 'sans',
  'cfa', 'cpa', 'cia', 'cma', 'frm',
  'salesforce', 'hubspot', 'google analytics', 'google ads',
  'scrum master', 'product owner', 'agile coach',
  'pmp certified', 'pmp certification',
];

const EDUCATION_DEGREES = [
  "bachelor's", "bachelor", "b.s.", "b.a.", "bs", "ba",
  "master's", "master", "m.s.", "m.a.", "ms", "ma", "mba",
  "phd", "ph.d.", "doctorate", "doctoral",
  "associate", "a.s.", "a.a.",
  "bachelor of science", "bachelor of arts", "bachelor of engineering",
  "master of science", "master of arts", "master of business administration",
  "philosophy doctor",
];

const EXPERIENCE_SIGNALS = [
  { level: 'entry', years: 1, patterns: ['entry level', 'junior', '0-2 years', '1-2 years', '0-1 years', 'new grad', 'graduate'] },
  { level: 'mid', years: 4, patterns: ['mid-level', 'mid level', '3-5 years', '2-4 years', '4-6 years', 'intermediate'] },
  { level: 'senior', years: 7, patterns: ['senior', 'sr.', '5-7 years', '5+ years', '6-8 years', '7+ years'] },
  { level: 'lead', years: 10, patterns: ['lead', 'principal', 'staff', 'architect', 'manager', 'head of', 'director', 'vp', '10+ years', '8+ years'] },
];

function extractJdKeywords(jd: string): {
  hardSkills: string[];
  softSkills: string[];
  certifications: string[];
  education: string[];
  experienceLevel: string | null;
  experienceYears: number | null;
} {
  const lower = jd.toLowerCase();
  const hardSkills: string[] = [];
  const softSkills: string[] = [];
  const certifications: string[] = [];
  const education: string[] = [];
  let experienceLevel: string | null = null;
  let experienceYears: number | null = null;

  for (const skill of HARD_SKILLS) {
    if (lower.includes(skill)) hardSkills.push(skill);
  }

  for (const skill of SOFT_SKILLS) {
    if (lower.includes(skill)) softSkills.push(skill);
  }

  for (const cert of CERTIFICATIONS) {
    if (lower.includes(cert)) certifications.push(cert);
  }

  for (const degree of EDUCATION_DEGREES) {
    if (lower.includes(degree)) education.push(degree);
  }

  for (const sig of EXPERIENCE_SIGNALS) {
    for (const pattern of sig.patterns) {
      if (lower.includes(pattern)) {
        if (!experienceLevel || sig.years > (experienceYears || 0)) {
          experienceLevel = sig.level;
          experienceYears = sig.years;
        }
        break;
      }
    }
  }

  return { hardSkills, softSkills, certifications, education, experienceLevel, experienceYears };
}

function extractResumeText(sections: Record<string, any>): string {
  const parts: string[] = [];

  if (sections.summary?.text) parts.push(sections.summary.text);

  if (sections.skills?.items) {
    for (const item of sections.skills.items) {
      if (item.name) parts.push(String(item.name));
    }
  }

  if (sections.experience?.items) {
    for (const exp of sections.experience.items) {
      if (exp.role) parts.push(String(exp.role));
      if (exp.company) parts.push(String(exp.company));
      const desc = exp.description || exp.descriptions || exp.achievements || '';
      if (Array.isArray(desc)) parts.push(desc.join(' '));
      else if (typeof desc === 'string') parts.push(desc);
    }
  }

  if (sections.education?.items) {
    for (const edu of sections.education.items) {
      if (edu.degree) parts.push(String(edu.degree));
      if (edu.field) parts.push(String(edu.field));
      if (edu.institution) parts.push(String(edu.institution));
    }
  }

  if (sections.projects?.items) {
    for (const proj of sections.projects.items) {
      if (proj.name) parts.push(String(proj.name));
      const desc = proj.description || proj.descriptions || '';
      if (Array.isArray(desc)) parts.push(desc.join(' '));
      else if (typeof desc === 'string') parts.push(desc);
    }
  }

  if (sections.certifications?.items) {
    for (const cert of sections.certifications.items) {
      if (cert.name) parts.push(String(cert.name));
    }
  }

  return parts.join(' ').toLowerCase();
}

function computeDensity(text: string, keywords: string[]): JdDensityItem[] {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const items: JdDensityItem[] = [];

  for (const kw of keywords) {
    const kwCount = lower.split(kw).length - 1;
    if (kwCount === 0) continue;
    const density = (kwCount / totalWords) * 100;
    const optimalMin = 2.3;
    const optimalMax = 3.1;
    let status: 'low' | 'good' | 'high' = 'good';
    if (density < optimalMin) status = 'low';
    else if (density > optimalMax) status = 'high';
    items.push({
      keyword: kw,
      found: kwCount,
      optimalMin: Math.round(optimalMin * 10) / 10,
      optimalMax: Math.round(optimalMax * 10) / 10,
      status,
    });
  }

  return items.sort((a, b) => b.found - a.found).slice(0, 20);
}

export async function matchWithJd(
  sections: Record<string, any>,
  jobDescription: string,
  targetRole?: string,
): Promise<{
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: JdKeywordItem[];
  keywordDensity: JdDensityItem[];
  suggestions: string[];
}> {
  const jdData = extractJdKeywords(jobDescription);
  const resumeText = extractResumeText(sections);
  const allJdKeywords: string[] = [];
  const matchedKeywords: string[] = [];
  const missingKeywords: JdKeywordItem[] = [];

  const categories: { keywords: string[]; category: JdKeywordItem['category']; required: boolean }[] = [
    { keywords: jdData.hardSkills, category: 'hard-skill', required: true },
    { keywords: jdData.softSkills, category: 'soft-skill', required: false },
    { keywords: jdData.certifications, category: 'certification', required: true },
    { keywords: jdData.education, category: 'education', required: true },
  ];

  for (const group of categories) {
    for (const kw of group.keywords) {
      allJdKeywords.push(kw);
      const inResume = resumeText.includes(kw);
      if (inResume) {
        matchedKeywords.push(kw);
      }
      missingKeywords.push({ keyword: kw, category: group.category, required: group.required, inResume });
    }
  }

  // Calculate match score
  const totalKeywords = allJdKeywords.length;
  const matchedCount = matchedKeywords.length;
  const requiredKeywords = missingKeywords.filter((k) => k.required);
  const matchedRequired = requiredKeywords.filter((k) => k.inResume).length;
  const requiredTotal = requiredKeywords.length;

  const hardSkillWeight = 0.5;
  const softSkillWeight = 0.15;
  const expWeight = jdData.experienceLevel ? 0.2 : 0;
  const eduWeight = jdData.education.length > 0 ? 0.15 : 0;
  const certWeight = jdData.certifications.length > 0 ? (1 - hardSkillWeight - softSkillWeight - expWeight - eduWeight) : 0;

  let score = 0;
  if (totalKeywords > 0) {
    const overallMatch = matchedCount / totalKeywords;
    score += overallMatch * 50;
  }
  if (requiredTotal > 0) {
    const reqMatch = matchedRequired / requiredTotal;
    score += reqMatch * 30;
  }
  score += 20;

  score = Math.round(Math.min(100, score));

  // Compute density
  const density = computeDensity(resumeText, matchedKeywords.slice(0, 15));

  // Build suggestions
  const suggestions: string[] = [];
  const missingRequired = missingKeywords.filter((k) => k.required && !k.inResume).slice(0, 5);
  if (missingRequired.length > 0) {
    suggestions.push(`Add these required skills: ${missingRequired.map((k) => k.keyword).join(', ')}`);
  }
  if (jdData.experienceLevel && !resumeText.includes(`${jdData.experienceLevel}`)) {
    const years = jdData.experienceYears || 3;
    suggestions.push(`The JD asks for ${jdData.experienceLevel}-level experience (~${years}+ years). Ensure your experience section reflects this seniority`);
  }
  if (jdData.education.length > 0) {
    const missingEdu = jdData.education.filter((e) => !resumeText.includes(e));
    if (missingEdu.length > 0) {
      suggestions.push(`The JD mentions ${missingEdu[0]} — ensure your education section is complete`);
    }
  }
  const lowDensity = density.filter((d) => d.status === 'low');
  if (lowDensity.length > 0) {
    const top = lowDensity.slice(0, 3).map((d) => d.keyword).join(', ');
    suggestions.push(`Increase mentions of "${top}" — optimal density is 2.3-3.1% of resume text`);
  }
  if (score < 60 && suggestions.length < 3) {
    suggestions.push(`Tailor your resume to this specific job — mirror the JD's exact language and terminology`);
  }

  return {
    matchScore: score,
    matchedKeywords: [...new Set(matchedKeywords)],
    missingKeywords,
    keywordDensity: density,
    suggestions,
  };
}
