import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { AiProvider } from './assistant.interface';
import { createAiProvider } from './assistant.factory';
import { PrismaService } from '../database/prisma.service';
import { AIStatus } from '@prisma/client';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private provider: AiProvider;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    this.provider = createAiProvider(this.config);
  }

  private getPromptsDir(): string {
    const candidates = [
      resolve(process.cwd(), '..', '..', 'packages', 'prompts'),
      resolve(__dirname, '..', '..', '..', '..', '..', 'packages', 'prompts'),
      resolve(process.cwd(), 'packages', 'prompts'),
    ];
    for (const dir of candidates) {
      if (existsSync(dir)) return dir;
    }
    return candidates[0];
  }

  private loadPrompt(name: string): string {
    try {
      return readFileSync(join(this.getPromptsDir(), `${name}.md`), 'utf-8');
    } catch {
      this.logger.warn(`Prompt file ${name}.md not found, using fallback`);
      return '';
    }
  }

  private buildPrompt(template: string, vars: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
    }
    return result;
  }

  private extractJson(text: string): Record<string, unknown> {
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        this.logger.warn(`Failed to parse JSON from AI response: ${text.slice(0, 200)}`);
      }
    }
    return { text };
  }

  private async logCall(feature: string, provider: string, responseTime: number, status: AIStatus, error?: string) {
    try {
      await this.prisma.aILog.create({
        data: { provider, feature, responseTime, status, error },
      });
    } catch (e) {
      this.logger.warn(`Failed to log AI call: ${e instanceof Error ? e.message : e}`);
    }
  }

  private formatInstruction(prefix: string, format: string): string {
    const isBullet = format === 'bulletPoints';
    switch (prefix) {
      case 'summary':
        return isBullet
          ? '{\n  "bulletPoints": ["Quantified bullet point 1 with impact", "Quantified bullet point 2 with technologies", "Quantified bullet point 3 with result"],\n  "keywords": ["keyword1", "keyword2", "keyword3"]\n}'
          : '{\n  "summary": "2-4 sentence professional summary highlighting experience, key achievements, and career focus",\n  "keywords": ["keyword1", "keyword2", "keyword3"]\n}';
      case 'experience':
        return isBullet
          ? '{\n  "bulletPoints": ["achievement 1 with quantified impact", "achievement 2 with technologies used", "achievement 3 with measurable result"]\n}'
          : '{\n  "description": "2-3 sentence paragraph describing the experience, technologies used, and impact"\n}';
      case 'project':
        return isBullet
          ? '{\n  "bulletPoints": ["Bullet point 1 describing key contribution", "Bullet point 2 with technologies used", "Bullet point 3 with measurable outcome"],\n  "keywords": ["keyword1", "keyword2"]\n}'
          : '{\n  "description": "1-2 sentence description highlighting impact and technologies used",\n  "keywords": ["keyword1", "keyword2"]\n}';
      case 'achievements':
        return isBullet
          ? '{\n  "achievements": ["Quantified achievement 1", "Quantified achievement 2", "Quantified achievement 3"]\n}'
          : '{\n  "description": "2-3 sentence paragraph describing key achievements, technologies used, and business impact"\n}';
      default:
        return '{}';
    }
  }

  async generateSummary(vars: {
    targetRole: string; yearsExperience: string; skills: string; currentRole: string; experience?: string; projects?: string; existingSummary?: string; format?: string;
  }): Promise<Record<string, unknown>> {
    const promptText = this.loadPrompt('summary');
    const existingNote = vars.existingSummary
      ? `The user already has this summary:\n${vars.existingSummary}\n\nPlease improve and rewrite it — keep the key points but make it stronger, more concise, and more impactful.`
      : '';
    const { existingSummary, ...templateVars } = vars;
    const prompt = this.buildPrompt(promptText, {
      ...templateVars,
      formatInstruction: this.formatInstruction('summary', vars.format || 'paragraph'),
    });
    const finalPrompt = existingNote ? `${prompt}\n\n${existingNote}` : prompt;
    const start = Date.now();
    try {
      const response = await this.provider.generate(finalPrompt);
      const result = this.extractJson(response);
      await this.logCall('generate-summary', this.provider.name, Date.now() - start, 'SUCCESS');
      return result;
    } catch (e) {
      await this.logCall('generate-summary', this.provider.name, Date.now() - start, 'FAILED', e instanceof Error ? e.message : 'Unknown error');
      throw e;
    }
  }

  async rewriteExperience(vars: {
    targetRole: string; role: string; company: string; achievements: string[]; format?: string;
  }): Promise<Record<string, unknown>> {
    const promptText = this.loadPrompt('experience');
    const prompt = this.buildPrompt(promptText, {
      ...vars,
      achievements: vars.achievements.join('\n'),
      formatInstruction: this.formatInstruction('experience', vars.format || 'bulletPoints'),
    });
    const start = Date.now();
    try {
      const response = await this.provider.generate(prompt);
      const result = this.extractJson(response);
      await this.logCall('rewrite-experience', this.provider.name, Date.now() - start, 'SUCCESS');
      return result;
    } catch (e) {
      await this.logCall('rewrite-experience', this.provider.name, Date.now() - start, 'FAILED', e instanceof Error ? e.message : 'Unknown error');
      throw e;
    }
  }

  async generateProject(vars: {
    projectName: string; domain: string; techStack: string[]; targetRole: string; careerContext?: string; format?: string;
  }): Promise<Record<string, unknown>> {
    const promptText = this.loadPrompt('project');
    const { careerContext, ...promptVars } = vars;
    const prompt = this.buildPrompt(promptText, {
      ...promptVars,
      techStack: vars.techStack.join(', '),
      careerContext: careerContext ? `Relevant career context (use this to tailor the description):\n${careerContext}` : '',
      formatInstruction: this.formatInstruction('project', vars.format || 'paragraph'),
    });
    const start = Date.now();
    try {
      const response = await this.provider.generate(prompt);
      const result = this.extractJson(response);
      await this.logCall('generate-project', this.provider.name, Date.now() - start, 'SUCCESS');
      return result;
    } catch (e) {
      await this.logCall('generate-project', this.provider.name, Date.now() - start, 'FAILED', e instanceof Error ? e.message : 'Unknown error');
      throw e;
    }
  }

  async generateAchievements(vars: {
    targetRole: string; skills: string; role: string; context: string; format?: string;
  }): Promise<Record<string, unknown>> {
    const promptText = this.loadPrompt('achievements');
    const prompt = this.buildPrompt(promptText, {
      ...vars,
      formatInstruction: this.formatInstruction('achievements', vars.format || 'bulletPoints'),
    });
    const start = Date.now();
    try {
      const response = await this.provider.generate(prompt);
      const result = this.extractJson(response);
      await this.logCall('generate-achievements', this.provider.name, Date.now() - start, 'SUCCESS');
      return result;
    } catch (e) {
      await this.logCall('generate-achievements', this.provider.name, Date.now() - start, 'FAILED', e instanceof Error ? e.message : 'Unknown error');
      throw e;
    }
  }
}
