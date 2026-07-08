import type { AtsSuggestion } from '../interfaces/ats.interface';

const FILLER_PHRASES = [
  'fast learner', 'quick learner', 'team player', 'hardworking', 'hard working',
  'go-getter', 'go getter', 'results-oriented', 'results oriented', 'detail-oriented',
  'detail oriented', 'excellent communication', 'excellent verbal', 'excellent written',
  'proven track record', 'think outside the box', 'synergy', 'self-starter',
  'self starter', 'highly motivated', 'people person', 'passionate about',
  'type a personality', 'work hard play hard', 'driven', 'motivated',
];

const BUZZWORDS = [
  'leverage', 'utilize', 'optimize', 'streamline', 'robust', 'innovative',
  'dynamic', 'passionate', 'world-class', 'best-in-class', 'best in class',
  'cutting-edge', 'cutting edge', 'state-of-the-art', 'next generation',
  'game-changer', 'game changer', 'revolutionary', 'breakthrough',
  'granular', 'holistic', 'scalable', 'seamless', 'transformative',
];

const AMBIGUOUS_PHRASES = [
  'helped with', 'involved in', 'assisted with', 'participated in',
  'contributed to', 'worked on', 'was part of', 'was responsible for',
  'supported the', 'was a member of', 'took part in', 'assisted',
];

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split(/[/-]/);
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10) - 1;
    const year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year)) return new Date(year, month);
  }
  return null;
}

function detectEmploymentGaps(items: Record<string, any>[]): string[] {
  const gaps: string[] = [];
  const datedItems: { start: Date; end: Date | null; role: string }[] = [];

  for (const item of items) {
    const role = String(item.role || item.title || '');
    let startStr = '';
    let endStr = '';

    for (const key of Object.keys(item)) {
      const lower = key.toLowerCase();
      if (lower.includes('start') || lower === 'from') startStr = String(item[key] || '');
      if (lower.includes('end') || lower === 'to') endStr = String(item[key] || '');
    }

    const start = parseDate(startStr);
    const end = endStr && endStr.toLowerCase() !== 'present' ? parseDate(endStr) : null;

    if (start) {
      datedItems.push({ start, end, role });
    }
  }

  datedItems.sort((a, b) => a.start.getTime() - b.start.getTime());

  for (let i = 1; i < datedItems.length; i++) {
    const prev = datedItems[i - 1];
    const curr = datedItems[i];
    const prevEnd = prev.end || new Date();
    const gapMonths = (curr.start.getFullYear() - prevEnd.getFullYear()) * 12 +
      (curr.start.getMonth() - prevEnd.getMonth());

    if (gapMonths > 6) {
      const years = Math.floor(gapMonths / 12);
      const months = gapMonths % 12;
      const gapStr = years > 0 ? `${years}y ${months}m` : `${months}m`;
      gaps.push(`Employment gap of ${gapStr} between "${prev.role}" and "${curr.role}"`);
    }
  }

  return gaps;
}

export function scoreRedFlags(
  experienceItems: Record<string, any>[],
  allText: string[],
): { score: number; suggestions: AtsSuggestion[] } {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;
  const lower = allText.join(' ').toLowerCase();

  // Employment gaps
  const gaps = detectEmploymentGaps(experienceItems);
  for (const gap of gaps.slice(0, 3)) {
    score -= 5;
    suggestions.push({
      category: 'impact', severity: 'medium',
      message: gap + '. Consider adding a brief explanation or relevant activity during this period.',
      action: 'Add context for the employment gap (courses, freelance, volunteering)',
      section: 'experience',
    });
  }

  // Generic filler phrases
  const foundFillers = FILLER_PHRASES.filter((f) => lower.includes(f));
  for (const filler of foundFillers.slice(0, 3)) {
    score -= 5;
    suggestions.push({
      category: 'readability', severity: 'medium',
      message: `Replace generic phrase "${filler}" with specific evidence. Instead of claiming it, demonstrate it through achievements.`,
      action: `Remove "${filler}" and show it with a concrete example`,
      section: 'summary',
    });
  }

  // Overused buzzwords
  const foundBuzzwords = BUZZWORDS.filter((b) => lower.includes(b));
  for (const buzz of foundBuzzwords.slice(0, 3)) {
    score -= 3;
    suggestions.push({
      category: 'readability', severity: 'low',
      message: `Overused buzzword "${buzz}" detected. Replace with concrete, specific language.`,
      action: `Replace "${buzz}" with specific details about what you did and the outcome`,
      section: 'experience',
    });
  }

  // Ambiguous claims
  const foundAmbiguous = AMBIGUOUS_PHRASES.filter((a) => lower.includes(a));
  for (const amb of foundAmbiguous.slice(0, 3)) {
    score -= 5;
    suggestions.push({
      category: 'impact', severity: 'high',
      message: `Ambiguous phrase "${amb}" detected. Be specific about your direct contribution and the outcome.`,
      action: `Rewrite to show your specific role and impact (e.g., "Led development of X, resulting in Y% improvement")`,
      section: 'experience',
    });
  }

  return { score: Math.max(0, score), suggestions };
}
