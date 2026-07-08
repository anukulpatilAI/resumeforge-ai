import type { AtsSuggestion } from '../interfaces/ats.interface';

const OUTCOME_TRIGGERS = [
  'resulting in', 'resulted in', 'leading to', 'led to', 'which led to',
  'achieved', 'drove', 'delivered', 'generated', 'improved', 'increased',
  'decreased', 'reduced', 'saved', 'exceeded', 'accomplished',
];

const QUANT_PATTERN = /\d+%|\d+x|\$\d+|\d+ percent|\d+ million|\d+ thousand|\d+ users|\d+ customers/i;

const OVERUSED_VERBS = ['managed', 'responsible', 'handled', 'worked', 'did', 'made'];

function collectTexts(sections: Record<string, any>): string[] {
  const texts: string[] = [];
  for (const key of Object.keys(sections)) {
    if (key === 'sectionOrder' || key === '_key' || key === '$key') continue;
    const section = sections[key];
    if (section?.items) {
      for (const item of section.items) {
        for (const val of Object.values(item)) {
          if (typeof val === 'string') texts.push(val);
          if (Array.isArray(val)) texts.push(...val.filter((v: any) => typeof v === 'string'));
        }
      }
    }
    if (section?.text) texts.push(section.text);
    if (section?.content) {
      if (Array.isArray(section.content)) texts.push(...section.content.filter((v: any) => typeof v === 'string'));
      else if (typeof section.content === 'string') texts.push(section.content);
    }
  }
  return texts;
}

function quantifyBullets(sections: Record<string, any>): {
  ratio: number; bulletCount: number; quantifiedCount: number;
} {
  const texts = collectTexts(sections);
  const bulletLines = texts.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const first = trimmed.split(/\s/)[0]?.toLowerCase();
    if (!first) return false;
    const headers = ['education', 'experience', 'skills', 'projects', 'summary',
      'certifications', 'languages', 'interests', 'references', 'publications',
      'achievements', 'awards', 'leadership', 'volunteer',
    ];
    if (headers.includes(first)) return false;
    return true;
  });

  const quantified = bulletLines.filter((l) => QUANT_PATTERN.test(l));
  return {
    ratio: bulletLines.length > 0 ? quantified.length / bulletLines.length : 0,
    bulletCount: bulletLines.length,
    quantifiedCount: quantified.length,
  };
}

function verbVariety(sections: Record<string, any>): { score: number; overused: string[] } {
  const lower = collectTexts(sections).join(' ').toLowerCase();
  const foundOverused = OVERUSED_VERBS.filter((v) => lower.includes(v));
  return {
    score: Math.max(0, 100 - foundOverused.length * 10),
    overused: foundOverused,
  };
}

function outcomeLanguage(sections: Record<string, any>): {
  score: number; outcomeCount: number;
} {
  const lower = collectTexts(sections).join(' ').toLowerCase();
  let count = 0;
  for (const trigger of OUTCOME_TRIGGERS) {
    const regex = new RegExp(trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return { score: Math.min(100, count * 20), outcomeCount: count };
}

export function scoreAchievements(
  sections: Record<string, any>,
): { score: number; suggestions: AtsSuggestion[] } {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;

  const { ratio, bulletCount, quantifiedCount } = quantifyBullets(sections);

  // 1. Quantification ratio
  if (ratio < 0.2) {
    score -= 25;
    suggestions.push({
      category: 'impact', severity: 'high',
      message: `Only ${quantifiedCount}/${bulletCount} bullets are quantified (${Math.round(ratio * 100)}%). Aim for 40%+ to demonstrate measurable impact.`,
      action: 'Add numbers, percentages, or dollar amounts (e.g., "Increased X by Y%", "Reduced costs by Z")',
      section: 'experience',
    });
  } else if (ratio < 0.4) {
    score -= 10;
    suggestions.push({
      category: 'impact', severity: 'medium',
      message: `Only ${quantifiedCount}/${bulletCount} bullets quantified (${Math.round(ratio * 100)}%). Target 40%+ for stronger impact.`,
      action: 'Add metrics to more bullets — every achievement is stronger with a number attached',
      section: 'experience',
    });
  } else {
    score += 5;
    suggestions.push({
      category: 'impact', severity: 'low',
      message: `Great job! ${quantifiedCount}/${bulletCount} bullets are quantified (${Math.round(ratio * 100)}%). This strongly demonstrates impact.`,
      action: 'Keep maintaining this high quantification standard',
      section: 'experience',
    });
  }

  // 2. Verb variety
  const verbCheck = verbVariety(sections);
  for (const verb of verbCheck.overused) {
    score -= 10;
    suggestions.push({
      category: 'readability', severity: 'medium',
      message: `Overused verb "${verb}" detected. Use stronger, more specific action verbs.`,
      action: `Replace "${verb}" with a stronger verb (e.g., "spearheaded", "engineered", "optimized", "architected")`,
      section: 'experience',
    });
  }

  // 3. Outcome language
  const { outcomeCount } = outcomeLanguage(sections);
  const expItems = sections.experience?.items || [];
  const projItems = sections.projects?.items || [];
  const totalItems = expItems.length + projItems.length;

  if (outcomeCount < 2 && totalItems >= 5) {
    score -= 10;
    suggestions.push({
      category: 'impact', severity: 'medium',
      message: `Only ${outcomeCount} outcome phrases found. Hiring managers prioritize results, not just responsibilities.`,
      action: 'Add outcome language to each bullet (e.g., "which led to 30% faster deployment", "resulting in $50K annual savings")',
      section: 'experience',
    });
  } else if (outcomeCount >= 2) {
    score += 5;
    suggestions.push({
      category: 'impact', severity: 'low',
      message: `Good use of outcome language (${outcomeCount} phrases). This helps recruiters understand your impact.`,
      action: 'Continue framing responsibilities as results',
      section: 'experience',
    });
  }

  return { score: Math.max(0, score), suggestions };
}
