import { ACTION_VERBS } from '../keywords';
import type { AtsSuggestion } from '../interfaces/ats.interface';

const HOW_INDICATORS = ['by', 'using', 'through', 'via', 'with'];
const WHY_INDICATORS = ['resulting', 'leading', 'improving', 'reducing', 'enabling', 'which led', 'resulted in', 'leading to'];
const DUTY_PHRASES = ['responsible for', 'duties included', 'tasked with', 'role included', 'in charge of', 'handled', 'worked on', 'involved in', 'participated in', 'assisted with'];

export function scoreReadability(experienceItems: Record<string, unknown>[], summary: string): {
  score: number;
  suggestions: AtsSuggestion[];
} {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;
  let totalBullets = 0;
  let actionVerbCount = 0;
  let quantifierCount = 0;
  let structuredBulletCount = 0;
  let passiveBulletCount = 0;
  const allDescriptions: string[] = [];

  if (summary) allDescriptions.push(summary);

  for (const exp of experienceItems) {
    const rawDesc = exp.description || exp.descriptions || exp.achievements || '';
    const desc = Array.isArray(rawDesc) ? rawDesc : [String(rawDesc)];
    const descStr = desc.join(' ');
    allDescriptions.push(descStr);

    const bullets = Array.isArray(rawDesc) ? rawDesc : descStr.split('\n').filter((l: string) => l.trim().length > 0);
    totalBullets += bullets.length;

    for (const bullet of bullets) {
      const text = typeof bullet === 'string' ? bullet : '';
      const lower = text.trim().toLowerCase();
      const firstWord = lower.split(/\s+/)[0];
      if (firstWord && ACTION_VERBS.includes(firstWord)) {
        actionVerbCount++;
      }
      const numbers = text.match(/\d+/g);
      if (numbers) quantifierCount += numbers.length;

      // What + How + Why formula check
      const hasHow = HOW_INDICATORS.some((w) => lower.includes(w));
      const hasWhy = WHY_INDICATORS.some((w) => lower.includes(w)) || (numbers !== null && numbers.length > 0);
      if (hasHow || hasWhy) {
        structuredBulletCount++;
      }

      // Duty → Outcome detection
      if (DUTY_PHRASES.some((phrase) => lower.startsWith(phrase))) {
        passiveBulletCount++;
      }
    }
  }

  const totalEntries = experienceItems.length || 1;

  if (totalBullets < totalEntries * 2) {
    score -= 15;
    suggestions.push({
      category: 'readability', severity: 'high',
      message: 'Use bullet points for each experience entry (aim for 3-5 bullets per role).',
      action: 'Convert paragraphs to bullet points with action verbs',
      section: 'experience',
    });
  }

  if (actionVerbCount < totalBullets * 0.4) {
    score -= 15;
    suggestions.push({
      category: 'readability', severity: 'high',
      message: 'Start bullet points with strong action verbs (e.g., "Developed", "Led", "Optimized").',
      action: 'Lead each bullet with a powerful action verb',
      section: 'experience',
    });
  }

  if (quantifierCount < totalEntries) {
    score -= 10;
    suggestions.push({
      category: 'impact', severity: 'medium',
      message: 'Add quantified achievements (numbers, percentages, dollar amounts) to strengthen impact.',
      action: 'Include specific metrics like "increased efficiency by 20%"',
      section: 'experience',
    });
  }

  // What + How + Why formula check
  if (totalBullets > 0 && structuredBulletCount / totalBullets < 0.3) {
    score -= 10;
    suggestions.push({
      category: 'readability', severity: 'medium',
      message: 'Most bullets describe what you did but not how or why. Use the formula: "Action + How + Result" (e.g., "Built dashboard using React, reducing reporting time by 40%").',
      action: 'Add context (tools/methods) and outcomes (metrics/results) to each bullet',
      section: 'experience',
    });
  }

  // Duty → Outcome detection
  if (passiveBulletCount > 0) {
    const penalty = Math.min(passiveBulletCount * 10, 15);
    score -= penalty;
    suggestions.push({
      category: 'readability', severity: 'high',
      message: `"${passiveBulletCount > 1 ? 'Several bullets start' : 'A bullet starts'} with passive duty phrases like "${DUTY_PHRASES[0]}". Rewrite as achievements: "Achieved X by doing Y".`,
      action: `Replace "Responsible for leading team" → "Led 8-person team to ship 3 releases with zero rollbacks"`,
      section: 'experience',
    });
  }

  if (summary && summary.split(' ').length > 60) {
    score -= 5;
    suggestions.push({
      category: 'readability', severity: 'low',
      message: 'Professional summary is too long. Keep it under 60 words.',
      action: 'Trim summary to 2-3 concise sentences',
      section: 'summary',
    });
  }

  return { score: Math.max(0, score), suggestions };
}
