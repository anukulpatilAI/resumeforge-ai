import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AssistantService } from '../assistant/assistant.service';
import { scoreKeywords } from './scoring/keyword-scorer';
import { scoreFormatting } from './scoring/format-scorer';
import { scoreReadability } from './scoring/readability-scorer';
import { scoreLength } from './scoring/length-scorer';
import { scoreRedFlags } from './scoring/red-flag-scorer';
import { scoreSkillsAudit } from './scoring/skills-audit-scorer';
import { scoreAchievements } from './scoring/achievement-scorer';
import { scoreCareerProgression } from './scoring/career-progression-scorer';
import { scoreBiasDetection } from './scoring/bias-detection-scorer';
import { matchWithJd } from './scoring/jd-keyword-scorer';
import { SECTION_TITLES } from './keywords';
import type { AtsResult, AtsSuggestion, JdMatchResult } from './interfaces/ats.interface';

@Injectable()
export class AtsService {
  private readonly logger = new Logger(AtsService.name);

  constructor(
    private prisma: PrismaService,
    private assistant: AssistantService,
  ) {}

  async analyze(sections: Record<string, any>, targetRole: string = 'software engineer', resumeId?: string): Promise<AtsResult> {
    const skills = sections.skills?.items?.map((s: any) => s.name) || [];
    const summary = sections.summary?.text || '';
    const experienceItems = sections.experience?.items || [];

    const experienceTexts = experienceItems.map((exp: any) => {
      const desc = exp.description || exp.descriptions || exp.achievements || '';
      return Array.isArray(desc) ? desc.join(' ') : String(desc);
    });

    const projectItems = sections.projects?.items || [];
    const projectTexts = projectItems.map((proj: any) => {
      const desc = proj.description || proj.descriptions || '';
      return Array.isArray(desc) ? desc.join(' ') : String(desc);
    });

    const kwResult = await scoreKeywords(
      { skills, experience: experienceTexts, projects: projectTexts, summary },
      targetRole,
    );

    const { score: fmtScore, suggestions: fmtSuggestions } = scoreFormatting(
      sections,
      sections.sectionOrder || Object.keys(sections),
    );

    const { score: readScore, suggestions: readSuggestions } = scoreReadability(
      experienceItems,
      summary,
    );

    const { score: lenScore, suggestions: lenSuggestions } = scoreLength(sections);

    const { score: redFlagScore, suggestions: redFlagSuggestions } = scoreRedFlags(
      experienceItems,
      [...experienceTexts, ...projectTexts, summary],
    );

    const { score: skillsAuditScore, suggestions: skillsAuditSuggestions } = scoreSkillsAudit(
      sections,
      skills,
    );

    const { score: achievementScore, suggestions: achievementSuggestions } = scoreAchievements(sections);

    const { score: careerScore, suggestions: careerSuggestions } = scoreCareerProgression(experienceItems);

    const { score: biasScore, suggestions: biasSuggestions } = scoreBiasDetection(
      [...experienceTexts, ...projectTexts, summary],
    );

    const totalScore = Math.round(
      kwResult.score * 0.18 +
      fmtScore * 0.12 +
      readScore * 0.12 +
      lenScore * 0.08 +
      redFlagScore * 0.15 +
      skillsAuditScore * 0.08 +
      achievementScore * 0.12 +
      careerScore * 0.08 +
      biasScore * 0.07,
    );

    const keywordSuggestions: AtsSuggestion[] = kwResult.suggestions.map((msg) => ({
      category: 'keywords' as const,
      severity: (msg.includes('Universal') || msg.includes('action verbs') || msg.includes('quantified')) ? 'high' as const : 'medium' as const,
      message: msg,
    }));

    const allSuggestions: AtsSuggestion[] = [
      ...keywordSuggestions,
      ...fmtSuggestions,
      ...readSuggestions,
      ...lenSuggestions,
      ...redFlagSuggestions,
      ...skillsAuditSuggestions,
      ...achievementSuggestions,
      ...careerSuggestions,
      ...biasSuggestions,
    ];

    const result: AtsResult = {
      overallScore: totalScore,
      keywordScore: kwResult.score,
      formattingScore: fmtScore,
      readabilityScore: readScore,
      lengthScore: lenScore,
      redFlagScore,
      skillsAuditScore,
      achievementScore,
      careerScore,
      biasScore,
      matchedKeywords: [...new Set(kwResult.matchedKeywords)],
      missingKeywords: [...new Set(kwResult.missingKeywords)],
      suggestions: allSuggestions,
    };

    if (resumeId) {
      try {
        await this.prisma.aTSReport.create({
          data: {
            resumeId,
            score: totalScore,
            keywords: result.matchedKeywords,
            missingKeywords: result.missingKeywords,
            grammarScore: result.readabilityScore,
            formatScore: result.formattingScore,
            readability: result.readabilityScore,
            aiSuggestions: result.suggestions as any,
          },
        });
      } catch (err) {
        this.logger.warn('Failed to persist ATS report', (err as Error).message);
      }
    }

    return result;
  }

  async aiRewrite(
    suggestionType: string,
    sections: Record<string, any>,
    targetRole?: string,
  ): Promise<any> {
    const allTexts: string[] = [];
    for (const key of Object.keys(sections)) {
      const section = sections[key];
      if (section?.items) {
        for (const item of section.items) {
          for (const val of Object.values(item)) {
            if (typeof val === 'string') allTexts.push(val);
            if (Array.isArray(val)) allTexts.push(...val.filter((v: any) => typeof v === 'string'));
          }
        }
      }
      if (typeof section?.text === 'string') allTexts.push(section.text);
    }

    const skills = sections.skills?.items?.map((s: any) => s.name) || [];
    const role = targetRole || 'software engineer';

    switch (suggestionType) {
      case 'rewrite-summary': {
        const existingSummary = sections.summary?.text || '';
        return this.assistant.generateSummary({
          targetRole: role,
          yearsExperience: '5',
          skills: skills.join(', '),
          currentRole: sections.experience?.items?.[0]?.role || 'professional',
          existingSummary,
          format: 'paragraph',
        });
      }
      case 'rewrite-experience': {
        const firstExp = sections.experience?.items?.[0];
        return this.assistant.rewriteExperience({
          targetRole: role,
          role: firstExp?.role || 'Software Engineer',
          company: firstExp?.company || '',
          achievements: Array.isArray(firstExp?.descriptions)
            ? firstExp.descriptions
            : [firstExp?.description || ''].filter(Boolean),
          format: 'bulletPoints',
        });
      }
      case 'generate-achievements': {
        const expItems = sections.experience?.items || [];
        const context = expItems
          .slice(0, 2)
          .map((e: any) => `${e.role} at ${e.company || 'company'}`)
          .join('; ');
        return this.assistant.generateAchievements({
          targetRole: role,
          skills: skills.join(', '),
          role: expItems[0]?.role || 'professional',
          context,
          format: 'bulletPoints',
        });
      }
      case 'rewrite-project': {
        const firstProj = sections.projects?.items?.[0];
        return this.assistant.generateProject({
          projectName: firstProj?.name || 'your project',
          domain: targetRole || 'software',
          techStack: skills,
          targetRole: role,
          format: 'bulletPoints',
        });
      }
      default:
        return { text: 'No rewrite available for this suggestion type.' };
    }
  }

  async applySuggestion(
    sections: Record<string, any>,
    suggestionType: string,
    suggestionSection?: string,
    value?: string,
  ): Promise<Record<string, any>> {
    const updated = JSON.parse(JSON.stringify(sections));

    switch (suggestionType) {
      case 'rename-section': {
        if (suggestionSection && value) {
          const sectionData = updated[suggestionSection];
          if (sectionData) {
            delete updated[suggestionSection];
            updated[value] = sectionData;
            const orderKey = 'sectionOrder';
            if (updated[orderKey]) {
              updated[orderKey] = updated[orderKey].map((k: string) =>
                k === suggestionSection ? value : k,
              );
            }
          }
        }
        break;
      }

      case 'fix-dates': {
        const DATE_MMYYYY = /^(\d{2})\/(\d{4})$/;
        const DATE_MM_YYYY = /^(\d{2})-(\d{4})$/;
        const DATE_YYYY_MM = /^(\d{4})-(\d{2})$/;
        const MONTH_YYYY = /^(\w+)\s(\d{4})$/i;
        const MONTH_MAP: Record<string, string> = {
          january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
          july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
        };

        for (const sectionKey of Object.keys(updated)) {
          const section = updated[sectionKey];
          if (section?.items) {
            for (const item of section.items) {
              for (const key of Object.keys(item)) {
                const lower = key.toLowerCase();
                if (lower.includes('date') || lower.includes('start') || lower.includes('end') || lower === 'from' || lower === 'to') {
                  const val = item[key];
                  if (typeof val === 'string' && val.trim()) {
                    const trimmed = val.trim();
                    if (DATE_MMYYYY.test(trimmed)) {
                      // already MM/YYYY
                    } else if (DATE_MM_YYYY.test(trimmed)) {
                      item[key] = trimmed.replace(/-/, '/');
                    } else if (DATE_YYYY_MM.test(trimmed)) {
                      const [, y, m] = trimmed.match(DATE_YYYY_MM)!;
                      item[key] = `${m}/${y}`;
                    } else if (MONTH_YYYY.test(trimmed)) {
                      const [, month, year] = trimmed.match(MONTH_YYYY)!;
                      const m = MONTH_MAP[month.toLowerCase()];
                      if (m) item[key] = `${m}/${year}`;
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }

      case 'personal-info': {
        if (!updated.personal) updated.personal = { data: {} };
        if (!updated.personal.data) updated.personal.data = {};
        if (!updated.personal.data.email) updated.personal.data.email = 'your.email@example.com';
        if (!updated.personal.data.phone) updated.personal.data.phone = '+1 (555) 123-4567';
        if (!updated.personal.data.location) updated.personal.data.location = 'City, State';
        break;
      }

      case 'fix-filler': {
        const FILLERS = ['fast learner', 'quick learner', 'team player', 'hardworking',
          'go-getter', 'results-oriented', 'detail-oriented', 'proven track record',
          'think outside the box', 'self-starter', 'highly motivated', 'people person',
        ];
        for (const key of Object.keys(updated)) {
          const section = updated[key];
          if (section?.text && typeof section.text === 'string') {
            for (const phrase of FILLERS) {
              section.text = section.text.replace(new RegExp(phrase, 'gi'), '');
            }
          }
          if (section?.items) {
            for (const item of section.items) {
              for (const valKey of Object.keys(item)) {
                const val = item[valKey];
                if (typeof val === 'string') {
                  for (const phrase of FILLERS) {
                    item[valKey] = (item[valKey] as string).replace(new RegExp(phrase, 'gi'), '');
                  }
                }
                if (Array.isArray(val)) {
                  for (let i = 0; i < val.length; i++) {
                    if (typeof val[i] === 'string') {
                      for (const phrase of FILLERS) {
                        val[i] = val[i].replace(new RegExp(phrase, 'gi'), '');
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }

      case 'fix-buzzword': {
        const BUZZWORDS = ['leverage', 'utilize', 'optimize', 'streamline', 'robust',
          'innovative', 'dynamic', 'world-class', 'best-in-class', 'cutting-edge', 'game-changer',
        ];
        for (const key of Object.keys(updated)) {
          const section = updated[key];
          if (section?.items) {
            for (const item of section.items) {
              for (const valKey of Object.keys(item)) {
                const val = item[valKey];
                if (typeof val === 'string') {
                  for (const buzz of BUZZWORDS) {
                    (item[valKey] as string) = (item[valKey] as string).replace(
                      new RegExp(`\\b${buzz}\\b`, 'gi'), 'refined',
                    );
                  }
                }
                if (Array.isArray(val)) {
                  for (let i = 0; i < val.length; i++) {
                    if (typeof val[i] === 'string') {
                      for (const buzz of BUZZWORDS) {
                        val[i] = val[i].replace(new RegExp(`\\b${buzz}\\b`, 'gi'), 'refined');
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }

      case 'fix-ambiguous': {
        const AMBIGUOUS = ['helped with', 'involved in', 'assisted with', 'participated in',
          'contributed to', 'worked on', 'was part of', 'was responsible for',
        ];
        const REPLACEMENTS: [string, string][] = [
          ['helped with', 'led'],
          ['involved in', 'drove'],
          ['assisted with', 'supported'],
          ['participated in', 'contributed to'],
          ['contributed to', 'delivered'],
          ['worked on', 'developed'],
          ['was part of', 'part of'],
          ['was responsible for', 'owned'],
        ];
        for (const key of Object.keys(updated)) {
          const section = updated[key];
          if (section?.items) {
            for (const item of section.items) {
              for (const valKey of Object.keys(item)) {
                const val = item[valKey];
                if (typeof val === 'string') {
                  for (const [from, to] of REPLACEMENTS) {
                    (item[valKey] as string) = (item[valKey] as string).replace(new RegExp(from, 'gi'), to);
                  }
                }
                if (Array.isArray(val)) {
                  for (let i = 0; i < val.length; i++) {
                    if (typeof val[i] === 'string') {
                      for (const [from, to] of REPLACEMENTS) {
                        val[i] = val[i].replace(new RegExp(from, 'gi'), to);
                      }
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }

      default:
        break;
    }

    return updated;
  }

  async matchWithJd(
    sections: Record<string, any>,
    jobDescription: string,
    targetRole?: string,
  ): Promise<JdMatchResult> {
    return matchWithJd(sections, jobDescription, targetRole);
  }
}
