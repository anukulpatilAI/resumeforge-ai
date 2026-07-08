import type { AtsSuggestion } from '../interfaces/ats.interface';
import type { SectionData } from '../interfaces/ats.interface';

function extractItemText(item: Record<string, unknown>): string[] {
  const results: string[] = [];

  const textFields = ['description', 'descriptions', 'achievements', 'summary', 'details'];
  for (const field of textFields) {
    const val = item[field];
    if (Array.isArray(val)) {
      results.push(...val.filter((v): v is string => typeof v === 'string'));
    } else if (typeof val === 'string') {
      results.push(val);
    }
  }

  const scalarFields = ['role', 'company', 'degree', 'institution', 'name', 'domain', 'technologies', 'techStack'];
  for (const field of scalarFields) {
    const val = item[field];
    if (typeof val === 'string') {
      results.push(val);
    }
    if (Array.isArray(val)) {
      results.push(...val.filter((v): v is string => typeof v === 'string'));
    }
  }

  return results;
}

export function scoreLength(sections: Record<string, SectionData>): {
  score: number;
  suggestions: AtsSuggestion[];
} {
  const suggestions: AtsSuggestion[] = [];
  const allText: string[] = [];

  for (const sectionKey of Object.keys(sections)) {
    const section = sections[sectionKey];
    if (section?.visible === false) continue;
    if (section?.text) allText.push(section.text);
    if (section?.items) {
      for (const item of section.items) {
        allText.push(...extractItemText(item as Record<string, unknown>));
      }
    }
  }

  const wordCount = allText.join(' ').split(/\s+/).filter(Boolean).length;

  let score: number;
  if (wordCount >= 400 && wordCount <= 800) {
    score = 100;
  } else if (wordCount >= 300 && wordCount < 400) {
    score = 70;
  } else if (wordCount > 800 && wordCount <= 1000) {
    score = 70;
  } else if (wordCount > 1000) {
    score = 40;
  } else {
    score = Math.round((wordCount / 300) * 50);
  }

  if (wordCount < 300) {
    suggestions.push({
      category: 'length', severity: 'high',
      message: `Resume is too short (${wordCount} words). Aim for 400-800 words for a strong one-page resume.`,
      action: 'Expand each section with more details and achievements',
    });
  } else if (wordCount > 1000) {
    suggestions.push({
      category: 'length', severity: 'medium',
      message: `Resume is quite long (${wordCount} words). Consider trimming to 800 words for conciseness.`,
      action: 'Remove redundant or outdated information',
    });
  }

  return { score: Math.max(0, score), suggestions };
}
