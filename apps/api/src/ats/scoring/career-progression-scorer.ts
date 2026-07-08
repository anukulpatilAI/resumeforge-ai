import type { AtsSuggestion } from '../interfaces/ats.interface';

const SENIORITY_TAGS = [
  { level: 0, labels: ['intern', 'trainee', 'apprentice', 'junior', 'jr'] },
  { level: 1, labels: ['associate', 'analyst', 'coordinator', 'specialist', 'developer', 'engineer'] },
  { level: 2, labels: ['senior', 'sr', 'lead', 'staff', 'principal', 'architect'] },
  { level: 3, labels: ['manager', 'director', 'head of', 'vp', 'vice president', 'chief', 'cto', 'cfo', 'ceo'] },
];

const PROGRESSION_PHRASES = [
  'promot', 'advance', 'escalat', 'elevat', 'grow into', 'transition to',
  'took on', 'expanded', 'broadened',
];

function detectLevel(title: string): number {
  const lower = title.toLowerCase();
  let maxLevel = 0;
  for (const tier of SENIORITY_TAGS) {
    for (const label of tier.labels) {
      if (lower.includes(label)) {
        maxLevel = Math.max(maxLevel, tier.level);
      }
    }
  }
  return maxLevel;
}

function shortenRole(title: string): string {
  const lower = title.toLowerCase();
  for (const tier of [...SENIORITY_TAGS].reverse()) {
    for (const label of tier.labels) {
      if (lower.includes(label)) {
        return lower.replace(label, '').trim();
      }
    }
  }
  return lower;
}

export function scoreCareerProgression(
  experienceItems: Record<string, any>[],
): { score: number; suggestions: AtsSuggestion[] } {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;

  if (experienceItems.length < 2) {
    return { score, suggestions };
  }

  const roles = experienceItems.map((item) => {
    const title = String(item.role || item.title || '');
    const level = detectLevel(title);
    return { title, level };
  });

  // Chronological order (oldest first for progression analysis)
  const ordered = [...roles].reverse();

  // Check for upward trajectory
  let promotions = 0;
  let lateralMoves = 0;
  let downgrades = 0;

  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const curr = ordered[i];
    if (curr.level > prev.level) {
      promotions++;
    } else if (curr.level === prev.level) {
      if (shortenRole(curr.title) !== shortenRole(prev.title)) {
        lateralMoves++;
      }
    } else {
      downgrades++;
    }
  }

  if (ordered.length >= 2) {
    const first = ordered[0];
    const last = ordered[ordered.length - 1];

    // No progression at all
    if (promotions === 0 && ordered.length >= 3) {
      score -= 15;
      suggestions.push({
        category: 'impact', severity: 'medium',
        message: `Career appears flat across ${ordered.length} roles (${ordered.map((r) => r.title || 'unknown').join(' → ')}). Hiring managers look for growth.`,
        action: 'Add context for each role change — promotions, expanded scope, or new responsibilities taken on',
        section: 'experience',
      });
    }

    // Same level from first to last role
    if (first.level === last.level && ordered.length >= 3) {
      score -= 10;
      suggestions.push({
        category: 'impact', severity: 'low',
        message: 'All roles appear at a similar seniority level. Consider highlighting increased scope or responsibilities even if the title did not change.',
        action: 'Add bullets that show growing scope (team size, budget, project complexity) even under the same title',
        section: 'experience',
      });
    }

    // Downgrade detected
    if (downgrades > 0) {
      score -= 5;
      suggestions.push({
        category: 'impact', severity: 'low',
        message: `Detected ${downgrades} role(s) with lower seniority than the previous. If this was a deliberate pivot (e.g., career change), frame it as intentional.`,
        action: 'Explain the context if it was a career shift or if the title doesn\'t reflect actual responsibilities',
        section: 'experience',
      });
    }
  }

  if (promotions >= 1) {
    score += 5;
    suggestions.push({
      category: 'impact', severity: 'low',
      message: `Good upward trajectory! ${promotions} promotion(s) detected across ${ordered.length} roles.`,
      action: 'Highlight promotions explicitly (e.g., "Promoted to X for exceeding targets")',
      section: 'experience',
    });
  }

  return { score: Math.max(0, Math.min(100, score)), suggestions };
}
