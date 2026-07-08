interface ResumeText {
  skills: string[];
  experience: string[];
  projects: string[];
  summary: string;
}

const UNIVERSAL_KEYWORDS: Record<string, string[]> = {
  'software-engineer': ['testing', 'agile', 'git', 'code review', 'collaboration'],
  'qa-engineer': ['test automation', 'test cases', 'bug tracking', 'agile', 'test strategy'],
  'frontend-developer': ['responsive design', 'accessibility', 'testing', 'git', 'performance'],
  'backend-developer': ['testing', 'api design', 'git', 'agile', 'documentation'],
  'fullstack-developer': ['testing', 'git', 'agile', 'api design', 'responsive'],
  'devops-engineer': ['automation', 'monitoring', 'ci/cd', 'documentation', 'security'],
  'data-scientist': ['data quality', 'model evaluation', 'experiment design', 'collaboration'],
  'data-engineer': ['data quality', 'pipeline monitoring', 'documentation', 'testing'],
  'product-manager': ['user research', 'stakeholder management', 'prioritization', 'data-driven'],
};

const DOMAIN_TERMS: Record<string, string[]> = {
  'fintech': ['compliance', 'fraud detection', 'risk management', 'regulatory', 'audit', 'reconciliation'],
  'healthcare': ['hipaa', 'patient data', 'clinical', 'medical records', 'compliance'],
  'ecommerce': ['catalog', 'inventory', 'order management', 'checkout', 'fulfillment'],
  'saas': ['multi-tenant', 'subscription', 'billing', 'onboarding', 'usage analytics'],
  'enterprise': ['erp', 'workflow', 'approval', 'compliance', 'audit trail'],
  'ai/ml': ['model deployment', 'training pipeline', 'feature engineering', 'inference'],
  'security': ['vulnerability', 'encryption', 'access control', 'threat modeling'],
};

const ADJACENCY_MAP: Record<string, string[]> = {
  'react': ['state management', 'component library', 'react testing library'],
  'python': ['package management', 'virtual environment'],
  'docker': ['container orchestration', 'image optimization'],
  'selenium': ['test framework', 'page object model', 'parallel execution'],
  'aws': ['cost optimization', 'security groups'],
  'sql': ['query optimization', 'indexing strategy'],
};

const ACRONYM_MAP: Record<string, string> = {
  'aws': 'Amazon Web Services',
  'seo': 'Search Engine Optimization',
  'api': 'Application Programming Interface',
  'sql': 'Structured Query Language',
  'html': 'HyperText Markup Language',
  'css': 'Cascading Style Sheets',
  'rest': 'Representational State Transfer',
  'http': 'HyperText Transfer Protocol',
  'ci/cd': 'Continuous Integration / Continuous Deployment',
  'json': 'JavaScript Object Notation',
  'xml': 'Extensible Markup Language',
  'saas': 'Software as a Service',
  'crm': 'Customer Relationship Management',
  'erp': 'Enterprise Resource Planning',
  'jwt': 'JSON Web Token',
  'oauth': 'Open Authorization',
  'dom': 'Document Object Model',
  'cli': 'Command Line Interface',
  'sdk': 'Software Development Kit',
  'ide': 'Integrated Development Environment',
  'orm': 'Object-Relational Mapping',
  'ui': 'User Interface',
  'ux': 'User Experience',
};

function extractAllTechnologies(texts: string[]): string[] {
  const signals = [
    'react', 'angular', 'vue', 'node', 'python', 'java', 'go', 'rust',
    'docker', 'kubernetes', 'postgresql', 'mongodb', 'redis', 'aws',
    'typescript', 'graphql', 'rest', 'spring', 'django', 'flask',
    'tensorflow', 'pytorch', 'kafka', 'spark', 'git', 'jenkins',
    'terraform', 'ansible', 'nginx', 'selenium', 'cypress', 'playwright',
    'next.js', 'tailwind', 'redux', 'jest', 'junit', 'pytest',
  ];
  const found: string[] = [];
  for (const text of texts) {
    const lower = text.toLowerCase();
    for (const tech of signals) {
      if (lower.includes(tech)) found.push(tech);
    }
  }
  return [...new Set(found)];
}

function extractDomainFromExperience(texts: string[]): string[] {
  const lower = texts.join(' ').toLowerCase();
  const detected: string[] = [];
  for (const [domain, terms] of Object.entries(DOMAIN_TERMS)) {
    for (const term of terms) {
      if (lower.includes(term)) detected.push(term);
    }
  }
  return [...new Set(detected)];
}

function detectIndustryFromExperience(texts: string[]): string | null {
  const lower = texts.join(' ').toLowerCase();
  for (const domain of Object.keys(DOMAIN_TERMS)) {
    const domainMatches = DOMAIN_TERMS[domain].filter((t) => lower.includes(t)).length;
    if (domainMatches >= 2) return domain;
  }
  return null;
}

export async function scoreKeywords(
  text: ResumeText,
  targetRole: string,
): Promise<{
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  domainKeywords: string[];
  techStackKeywords: string[];
  suggestions: string[];
}> {
  const allText = [
    ...text.skills,
    text.summary,
    ...text.experience,
    ...text.projects,
  ];

  const allLower = allText.join(' ').toLowerCase();
  const technologies = extractAllTechnologies(allText);
  const domainTerms = extractDomainFromExperience([...text.experience, ...text.projects]);
  const industry = detectIndustryFromExperience([...text.experience, ...text.projects]);

  // Normalize role for universal keyword lookup
  const roleKey = targetRole.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const universal = UNIVERSAL_KEYWORDS[roleKey] || UNIVERSAL_KEYWORDS['software-engineer'];

  // Score: how many universal keywords are present
  const matchedUniversal = universal.filter((kw) => allLower.includes(kw));
  const missingUniversal = universal.filter((kw) => !allLower.includes(kw));

  const universalScore = universal.length > 0
    ? (matchedUniversal.length / universal.length) * 100
    : 100;

  // Score: tech depth — are technologies used in experience or just listed as skills?
  const skillNames = text.skills.map((s) => s.toLowerCase());
  const experienceLower = text.experience.join(' ').toLowerCase();
  let techDepthScore = 100;

  const techsOnlyInSkills = skillNames.filter((s) => {
    if (s.length < 2) return false;
    const inExperience = experienceLower.includes(s);
    const inSkillList = skillNames.includes(s);
    return inSkillList && !inExperience;
  });

  if (techsOnlyInSkills.length > 0 && skillNames.length > 0) {
    const ratio = techsOnlyInSkills.length / skillNames.length;
    techDepthScore = Math.max(0, 100 - Math.round(ratio * 60));
  }

  // Score: top-third front-loading — do skills appear early?
  const topThirdText = [
    text.summary,
    ...text.experience.slice(0, 1),
  ].filter(Boolean).join(' ').toLowerCase();
  const topThirdWords = topThirdText.split(/\s+/).slice(0, 100).join(' ');
  let frontloadScore = 100;
  if (skillNames.length > 0) {
    const skillsInTopThird = skillNames.filter((s) => s.length >= 2 && topThirdWords.includes(s)).length;
    const frontloadRatio = skillsInTopThird / skillNames.length;
    if (frontloadRatio < 0.5) {
      frontloadScore = 50 + Math.round(frontloadRatio * 50);
    }
  }

  // Score: domain context
  const domainScore = industry
    ? 100
    : domainTerms.length > 0 ? 80 : 50;

  // Combined keyword score (avg of universal + tech depth + frontload + domain)
  const score = Math.round((universalScore * 0.3 + techDepthScore * 0.3 + frontloadScore * 0.2 + domainScore * 0.2));

  // Build suggestions
  const suggestions: string[] = [];

  if (missingUniversal.length > 0) {
    const topMissing = missingUniversal.slice(0, 4);
    suggestions.push(`Add universal keywords: ${topMissing.join(', ')} — these are expected in your role`);
  }

  if (techsOnlyInSkills.length > 0) {
    const top = techsOnlyInSkills.slice(0, 4);
    suggestions.push(`You list ${top.join(', ')} in skills but don't demonstrate them in experience — add context on how you used them`);
  }

  if (skillNames.length > 0) {
    const skillsInTopThird = skillNames.filter((s) => s.length >= 2 && topThirdWords.includes(s)).length;
    const frontloadRatio = skillsInTopThird / skillNames.length;
    if (frontloadRatio < 0.5 && skillNames.length > 2) {
      const pct = Math.round(frontloadRatio * 100);
      suggestions.push(`Only ${pct}% of your skills appear in the top third of your resume. Move key skills into your summary or first role description for better ATS weighting`);
    }
  }

  // Acronym pattern: check for tech acronyms used without full name
  for (const [acronym, fullName] of Object.entries(ACRONYM_MAP)) {
    const acronymInText = allLower.includes(acronym);
    const fullNameInText = allLower.includes(fullName.toLowerCase());
    if (acronymInText && !fullNameInText) {
      suggestions.push(`You use "${acronym.toUpperCase()}" without spelling it out. Add "${fullName} (${acronym.toUpperCase()})" on first mention`);
      break;
    }
  }

  if (!industry && domainTerms.length === 0) {
    suggestions.push('Add industry-specific context from your projects or domain');
  }

  if (industry) {
    const industryTerms = DOMAIN_TERMS[industry] || [];
    const missingDomain = industryTerms.filter((t) => !allLower.includes(t));
    if (missingDomain.length > 0) {
      suggestions.push(`Your resume suggests a ${industry} background — consider adding: ${missingDomain.slice(0, 3).join(', ')}`);
    }
  }

  // Adjacent skill suggestions (framed as optional enhancements)
  for (const tech of technologies) {
    const adjacent = ADJACENCY_MAP[tech] || [];
    const missingAdj = adjacent.filter((a) => !allLower.includes(a));
    if (missingAdj.length > 0 && suggestions.length < 5) {
      suggestions.push(`You mention ${tech} — consider also mentioning ${missingAdj[0]} if relevant`);
      break;
    }
  }

  // Action verb + quantification check (from existing data)
  const hasActionVerbs = text.experience.some((exp) => {
    const firstWord = exp.trim().split(/\s+/)[0]?.toLowerCase();
    return ['led', 'built', 'designed', 'developed', 'implemented', 'created', 'managed', 'optimized', 'reduced', 'improved'].includes(firstWord);
  });

  if (!hasActionVerbs && text.experience.length > 0) {
    suggestions.push('Start bullet points with strong action verbs (Led, Built, Designed, Implemented)');
  }

  const hasQuantified = text.experience.some((exp) => /\d+/.test(exp));
  if (!hasQuantified && text.experience.length > 0) {
    suggestions.push('Add quantified achievements (percentages, time saved, revenue impact) to strengthen impact');
  }

  return {
    score,
    matchedKeywords: [...new Set([...technologies, ...matchedUniversal, ...domainTerms])],
    missingKeywords: [...new Set(missingUniversal)],
    domainKeywords: [...new Set(domainTerms)],
    techStackKeywords: technologies,
    suggestions,
  };
}
