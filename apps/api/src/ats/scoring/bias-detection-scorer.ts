import type { AtsSuggestion } from '../interfaces/ats.interface';

interface BiasPattern {
  name: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  patterns: RegExp[];
  advice: string;
}

const BIAS_PATTERNS: BiasPattern[] = [
  {
    name: 'Age proxy — graduation year',
    description: 'Early graduation year may lead to age assumptions.',
    severity: 'low',
    patterns: [/graduated?\s*(19\d{2}|200[0-5])/i, /class\s*of\s*(19\d{2}|200[0-5])/i],
    advice: 'Consider removing graduation year to avoid age bias. Only include it if <5 years of experience.',
  },
  {
    name: 'Age proxy — early career dates',
    description: 'Work history dating back 20+ years may trigger age assumptions.',
    severity: 'low',
    patterns: [/\b(199[0-9]|200[0-4])\b/],
    advice: 'Consider summarizing early career (pre-2005) rather than listing every role to avoid age bias.',
  },
  {
    name: 'Gender proxy — gendered language',
    description: 'Gendered pronouns or phrases may trigger unconscious bias.',
    severity: 'medium',
    patterns: [/\b(he|she)\s+(is|was|has|led|managed)\b/i],
    advice: 'Use first-person implied (omitted) or neutral phrasing. Avoid pronouns in resumes entirely.',
  },
  {
    name: 'Gender proxy —称谓',
    description: 'Titles like Mrs., Miss, Mr. signal gender and can bias reviewers.',
    severity: 'medium',
    patterns: [/\b(Mrs\.?|Miss\.?|Mr\.?|Ms\.?)\s/i],
    advice: 'Remove titles from resume. Use full name only.',
  },
  {
    name: 'Cultural proxy — ethnic-sounding names',
    description: 'Non-Anglo names or cultural affiliations may trigger bias (note: informational only — do not change identity).',
    severity: 'low',
    patterns: [/[^\x00-\x7F]/], // non-ASCII characters in the document
    advice: 'Resumes with non-Anglo names statistically receive fewer callbacks. Consider adding more industry experience to compensate (research-backed, not a suggestion to change).',
  },
  {
    name: 'Cultural proxy — affiliations',
    description: 'Religious or cultural organizations may trigger bias.',
    severity: 'low',
    patterns: [/\b(church|temple|mosque|synagogue|bible|quran|prayer)\b/i],
    advice: 'Consider whether volunteer or affiliation entries are relevant to the target role. If not, removing them reduces potential bias without losing impact.',
  },
  {
    name: 'Disability proxy — health gaps',
    description: 'Unexplained multi-year gaps may lead to disability assumptions.',
    severity: 'low',
    patterns: [/\b(medical leave|health issue|disability|illness|surgery|hospitalization)\b/i],
    advice: 'Frame health-related gaps as "Career break — [year range]" without details. Employers do not need medical information.',
  },
  {
    name: 'SES proxy — education formatting',
    description: 'Listing high school or using informal education formatting may signal socioeconomic background.',
    severity: 'low',
    patterns: [/\b(high\s*school|ged)\b/i],
    advice: 'Remove high school if you have a college degree. If no degree, frame certifications and experience first.',
  },
];

export function scoreBiasDetection(
  allText: string[],
): { score: number; suggestions: AtsSuggestion[] } {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;
  const text = allText.join(' ');

  for (const bp of BIAS_PATTERNS) {
    const matches = bp.patterns.some((p) => p.test(text));
    if (matches) {
      score -= 5;
      suggestions.push({
        category: 'readability', severity: bp.severity,
        message: `[Informational] ${bp.name}: ${bp.description}`,
        action: bp.advice,
        section: 'experience',
      });
    }
  }

  return { score: Math.max(0, score), suggestions };
}
