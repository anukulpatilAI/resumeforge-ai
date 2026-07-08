import type { AtsSuggestion } from '../interfaces/ats.interface';

const CERTAINTY_QUALIFIERS = [
  'familiar with', 'basic knowledge', 'some experience', 'exposure to',
  'working knowledge', 'beginner', 'novice', 'some familiarity',
  'limited experience', 'basic understanding', 'learning',
];

const OUTDATED_TECH = [
  'internet explorer', 'ie6', 'ie7', 'ie8', 'flash', 'actionscript',
  'silverlight', 'jquery', 'bootstrap 3', 'angularjs', 'angular 1',
  'gulp', 'grunt', 'bower', 'coffeescript', 'handlebars',
  'backbone', 'marionette', 'php 4', 'php 5', 'vb6', 'vbscript',
  'classic asp', 'cobol', 'fortran', 'coldfusion', 'drupal 7',
];

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[._-\s]+/g, '');
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[\s,;:/]+/).filter(Boolean);
}

export function scoreSkillsAudit(
  sections: Record<string, any>,
  skillsTexts: string[],
): { score: number; suggestions: AtsSuggestion[] } {
  const suggestions: AtsSuggestion[] = [];
  let score = 100;

  const allTexts: string[] = [];
  for (const key of Object.keys(sections)) {
    if (key === 'sectionOrder' || key === '_key' || key === '$key') continue;
    const section = sections[key];
    if (section?.items) {
      for (const item of section.items) {
        for (const val of Object.values(item)) {
          if (typeof val === 'string') allTexts.push(val);
          if (Array.isArray(val)) allTexts.push(...val.filter((v: any) => typeof v === 'string'));
        }
      }
    }
    if (section?.text) allTexts.push(section.text);
    if (section?.content) {
      if (Array.isArray(section.content)) allTexts.push(...section.content.filter((v: any) => typeof v === 'string'));
      else if (typeof section.content === 'string') allTexts.push(section.content);
    }
  }

  const allLower = allTexts.join(' ').toLowerCase();
  const skillsLower = skillsTexts.map((s) => s.toLowerCase().trim());

  // 1. Skills repeated 3+ times (check against user's own skills list)
  const skillCounts = new Map<string, number>();
  const tokens = tokenize(allLower);
  for (const token of tokens) {
    if (skillsLower.some((sk) => normalizeSkill(sk) === normalizeSkill(token))) {
      const n = normalizeSkill(token);
      skillCounts.set(n, (skillCounts.get(n) || 0) + 1);
    }
  }

  for (const [skill, count] of skillCounts) {
    if (count >= 3) {
      score -= 2;
      suggestions.push({
        category: 'formatting', severity: 'low',
        message: `"${skill}" mentioned ${count}x. Consolidate to avoid repetition. List it once in the skills section and demonstrate it naturally in experience bullets.`,
        action: `Remove redundant mentions of "${skill}" and keep it in the skills section only`,
        section: 'skills',
      });
    }
  }

  // 2. Certainty qualifiers
  const foundQualifiers = CERTAINTY_QUALIFIERS.filter((q) => allLower.includes(q));
  for (const q of foundQualifiers.slice(0, 2)) {
    score -= 5;
    suggestions.push({
      category: 'impact', severity: 'high',
      message: `Weak qualifier "${q}" undermines confidence. Remove it or frame the skill as actively used.`,
      action: `Replace "${q}" with confident language (e.g., "used", "built with", "implemented in")`,
      section: 'skills',
    });
  }

  // 3. Unsupported skills
  if (skillsTexts.length > 0) {
    const experienceText = allTexts.join(' ').toLowerCase();
    const unsupportedSkills = skillsTexts.filter((skill) => {
      const normalized = normalizeSkill(skill);
      const words = normalized.split(/\s+/);
      return !words.every((w) => experienceText.includes(w));
    });

    for (const skill of unsupportedSkills.slice(0, 3)) {
      score -= 3;
      suggestions.push({
        category: 'formatting', severity: 'low',
        message: `"${skill}" is listed but not demonstrated in your experience. Hiring managers look for context, not just keywords.`,
        action: `Add a bullet point that shows how you used "${skill}" (or remove it if not applicable)`,
        section: 'skills',
      });
    }
  }

  // 4. Outdated technology detection
  const foundOutdated = OUTDATED_TECH.filter((t) => allLower.includes(t));
  for (const tech of foundOutdated.slice(0, 3)) {
    score -= 5;
    suggestions.push({
      category: 'formatting', severity: 'medium',
      message: `"${tech}" flagged as outdated. Consider removing it or reframing as legacy experience with transferable skills.`,
      action: `Remove "${tech}" or reframe it (e.g., "Maintained legacy ${tech} system while leading migration to modern stack")`,
      section: 'skills',
    });
  }

  return { score: Math.max(0, score), suggestions };
}
