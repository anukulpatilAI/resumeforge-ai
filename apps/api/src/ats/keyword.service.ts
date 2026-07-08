import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface KeywordEntry {
  keyword: string;
  category: string;
  weight: number;
  aliases?: string[];
}

@Injectable()
export class KeywordService {
  private readonly logger = new Logger(KeywordService.name);

  constructor(private prisma: PrismaService) {}

  async getKeywordsForRole(role: string): Promise<any[]> {
    const normalized = role.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const candidates = [
      normalized,
      ...this.getFallbackRoles(normalized),
    ];

    for (const candidate of candidates) {
      const keywords = await this.prisma.roleKeyword.findMany({
        where: { role: candidate },
        select: { keyword: true, category: true, weight: true, aliases: true },
      });
      if (keywords.length > 0) {
        return keywords;
      }
    }

    return [];
  }

  async getAllKeywordsForRole(role: string): Promise<string[]> {
    const entries = await this.getKeywordsForRole(role);
    return entries.map((e) => e.keyword);
  }

  async getKeywordsByCategory(role: string, category: string): Promise<any[]> {
    const normalized = role.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.roleKeyword.findMany({
      where: { role: normalized, category },
      select: { keyword: true, category: true, weight: true, aliases: true },
    });
  }

  private getFallbackRoles(normalized: string): string[] {
    if (normalized.includes('fullstack') || normalized.includes('full-stack')) return ['fullstack-developer', 'software-engineer'];
    if (normalized.includes('frontend') || normalized.includes('front-end') || normalized.includes('ui') || normalized.includes('web')) return ['frontend-developer', 'software-engineer'];
    if (normalized.includes('backend') || normalized.includes('back-end') || normalized.includes('server')) return ['backend-developer', 'software-engineer'];
    if (normalized.includes('qa') || normalized.includes('test') || normalized.includes('quality')) return ['qa-engineer', 'software-engineer'];
    if (normalized.includes('devops') || normalized.includes('sre') || normalized.includes('infrastructure') || normalized.includes('platform')) return ['devops-engineer', 'software-engineer'];
    if (normalized.includes('data') && (normalized.includes('scien') || normalized.includes('ml') || normalized.includes('machine'))) return ['data-scientist', 'data-engineer'];
    if (normalized.includes('data') && (normalized.includes('engine') || normalized.includes('pipeline'))) return ['data-engineer', 'data-scientist'];
    if (normalized.includes('product') && (normalized.includes('manager') || normalized.includes('owner'))) return ['product-manager'];
    return ['software-engineer'];
  }
}
