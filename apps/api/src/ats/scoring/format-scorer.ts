import type { SectionData } from '../interfaces/ats.interface';
import type { AtsSuggestion } from '../interfaces/ats.interface';
import { SECTION_TITLES } from '../keywords';

const STANDARD_HEADERS = new Set(SECTION_TITLES.map((t) => t.toLowerCase()));

function normalizeSectionKey(key: string): string {
  return key.replace(/[-_]/g, ' ').toLowerCase().trim();
}

function findBestStandardHeader(key: string): string | null {
  const normalized = normalizeSectionKey(key);
  if (STANDARD_HEADERS.has(normalized)) return null;
  const label = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  if (STANDARD_HEADERS.has(label)) return null;
  const candidates = [...STANDARD_HEADERS].sort((a, b) => {
    const distA = levenshtein(normalized, a);
    const distB = levenshtein(normalized, b);
    return distA - distB;
  });
  const best = candidates[0];
  const dist = levenshtein(normalized, best);
  return dist <= 3 ? best : null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  return dp[m][n];
}

const DATE_FORMAT_MMYYYY = /^\d{2}\/\d{4}$/;
const DATE_FORMAT_YYYY = /^\d{4}$/;
const DATE_FORMAT_YYYY_MM = /^\d{4}-\d{2}$/;

function detectDateFormat(dateStr: string): string | null {
  if (DATE_FORMAT_MMYYYY.test(dateStr)) return 'MM/YYYY';
  if (DATE_FORMAT_YYYY.test(dateStr)) return 'YYYY';
  if (DATE_FORMAT_YYYY_MM.test(dateStr)) return 'YYYY-MM';
  if (/^\d{2}-\d{4}$/.test(dateStr)) return 'MM-YYYY';
  if (/^\w+\s\d{4}$/i.test(dateStr)) return 'Month YYYY';
  return null;
}

function extractDateFields(items: Record<string, unknown>[]): string[] {
  const dates: string[] = [];
  for (const item of items) {
    for (const key of Object.keys(item)) {
      const lower = key.toLowerCase();
      if (lower.includes('date') || lower.includes('start') || lower.includes('end') || lower === 'from' || lower === 'to') {
        const val = item[key];
        if (typeof val === 'string' && val.trim()) dates.push(val.trim());
      }
    }
  }
  return dates;
}

export function scoreFormatting(sections: Record<string, SectionData>, sectionOrder: string[]): {
  score: number;
  suggestions: AtsSuggestion[];
} {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;

  const visibleSections = sectionOrder.filter((key) => sections[key]?.visible !== false);

  if (visibleSections.length < 3) {
    score -= 15;
    suggestions.push({
      category: 'formatting', severity: 'high',
      message: 'Resume has fewer than 3 sections. Add more sections to improve completeness.',
      action: 'Add missing sections like Skills, Experience, or Education',
      section: 'sections',
    });
  }

  // Section header standardization check
  let headerChanges = 0;
  for (const key of Object.keys(sections)) {
    if (key === 'personal' || key === 'sectionOrder') continue;
    const suggestion = findBestStandardHeader(key);
    if (suggestion) {
      headerChanges++;
      if (headerChanges <= 3) {
        const displayName = key.replace(/([A-Z])/g, ' $1').trim();
        suggestions.push({
          category: 'formatting', severity: 'medium',
          message: `Section "${displayName}" uses a non-standard name. Rename it to "${suggestion}" for better ATS parsing.`,
          action: `Rename "${displayName}" to "${suggestion}"`,
          section: key,
        });
      }
    }
  }
  if (headerChanges > 0) {
    score -= Math.min(headerChanges * 5, 15);
  }

  const hasSummary = sections.summary?.text?.trim();
  if (!hasSummary) {
    score -= 10;
    suggestions.push({
      category: 'formatting', severity: 'medium',
      message: 'No professional summary found. Add a brief summary at the top.',
      action: 'Add a professional summary section',
      section: 'summary',
    });
  }

  const hasSkills = sections.skills?.items && sections.skills.items.length > 0;
  if (!hasSkills) {
    score -= 10;
    suggestions.push({
      category: 'formatting', severity: 'high',
      message: 'No skills section found. Skills are critical for ATS matching.',
      action: 'Add skills categorized by proficiency',
      section: 'skills',
    });
  }

  const hasExperience = sections.experience?.items && sections.experience.items.length > 0;
  if (!hasExperience) {
    score -= 15;
    suggestions.push({
      category: 'formatting', severity: 'high',
      message: 'No experience section found. Add your work history.',
      section: 'experience',
    });
  }

  const personal = sections.personal?.data;
  if (!personal?.email) {
    score -= 5;
    suggestions.push({
      category: 'formatting', severity: 'medium',
      message: 'Email address is missing from personal information.',
      section: 'personal',
    });
  }

  // Date format consistency check
  const allDateFields: string[] = [];
  for (const sectionKey of Object.keys(sections)) {
    const section = sections[sectionKey];
    if (section?.visible === false) continue;
    if (section?.items?.length) {
      allDateFields.push(...extractDateFields(section.items as Record<string, unknown>[]));
    }
  }

  if (allDateFields.length >= 2) {
    const formats = new Set(allDateFields.map((d) => detectDateFormat(d)).filter(Boolean));
    if (formats.size > 1) {
      score -= 10;
      suggestions.push({
        category: 'formatting', severity: 'medium',
        message: `Inconsistent date formats detected (${[...formats].join(', ')}). Use MM/YYYY consistently.`,
        action: `Standardize all dates to MM/YYYY format`,
        section: 'experience',
      });
    }
  }

  // Contact info completeness check
  if (personal) {
    const missingContact: string[] = [];
    if (!personal.email) missingContact.push('email');
    if (!personal.phone) missingContact.push('phone');
    if (!personal.location) missingContact.push('location');
    if (missingContact.length > 0 && missingContact.length < 3) {
      score -= 5;
      suggestions.push({
        category: 'formatting', severity: 'medium',
        message: `Missing contact information: ${missingContact.join(', ')}.`,
        action: `Add ${missingContact.join(' and ')} to personal details`,
        section: 'personal',
      });
    }
    if (missingContact.length >= 3) {
      score -= 10;
      suggestions.push({
        category: 'formatting', severity: 'high',
        message: 'Contact information is mostly missing. Add email, phone, and location.',
        action: 'Add email, phone, and location to personal details',
        section: 'personal',
      });
    }
  }

  return { score: Math.max(0, score), suggestions };
}
