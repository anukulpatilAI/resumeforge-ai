import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resume.dto';

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId, deletedAt: null },
      include: { template: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: {
        template: true,
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!resume || resume.deletedAt) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return resume;
  }

  async create(userId: string, dto: CreateResumeDto) {
    const profile = await this.prisma.careerProfile.findUnique({ where: { userId } });
    const profileJson = (profile?.profileJson || {}) as any;
    const latestTemplate = await this.prisma.template.findFirst({ where: { isActive: true } });

    const defaultJson = {
      templateId: latestTemplate?.id || null,
      sections: {
        personal: { visible: true, data: profileJson.personalInfo || {} },
        summary: { visible: true, text: profileJson.summary || '' },
        education: { visible: true, items: profileJson.education || [] },
        skills: { visible: true, items: profileJson.skills || [] },
        experience: { visible: true, items: profileJson.experience || [] },
        projects: { visible: true, items: profileJson.projects || [] },
        certifications: { visible: true, items: profileJson.certifications || [] },
        languages: { visible: true, items: profileJson.languages || [] },
      },
      sectionOrder: ['personal', 'summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'languages'],
      metadata: { targetRole: dto.targetRole || '', experienceLevel: dto.experienceLevel || '', industry: dto.industry || '' },
    };

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        title: dto.title || 'My Resume',
        targetRole: dto.targetRole,
        experienceLevel: dto.experienceLevel,
        industry: dto.industry,
        templateId: latestTemplate?.id,
      },
    });

    await this.prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        version: 1,
        resumeJson: defaultJson as any,
      },
    });

    return this.prisma.resume.findUnique({
      where: { id: resume.id },
      include: { template: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  async update(id: string, userId: string, dto: UpdateResumeDto) {
    const existing = await this.prisma.resume.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException('Resume not found');
    if (existing.userId !== userId) throw new ForbiddenException();

    const resume = await this.prisma.resume.update({
      where: { id },
      data: {
        title: dto.title,
        targetRole: dto.targetRole,
        experienceLevel: dto.experienceLevel,
        industry: dto.industry,
        templateId: dto.templateId,
      },
    });

    if (dto.sections || dto.metadata || dto.sectionOrder || dto.templateId) {
      const latestVersion = await this.prisma.resumeVersion.findFirst({
        where: { resumeId: id },
        orderBy: { version: 'desc' },
      });

      const currentJson = (latestVersion?.resumeJson || {}) as any;
      const updatedJson = {
        ...currentJson,
        templateId: dto.templateId ?? currentJson.templateId,
        sections: dto.sections ? { ...currentJson.sections, ...dto.sections as any } : currentJson.sections,
        sectionOrder: dto.sectionOrder || currentJson.sectionOrder,
        metadata: dto.metadata ? { ...currentJson.metadata, ...dto.metadata as any } : currentJson.metadata,
      };

      const newVersion = await this.prisma.resumeVersion.create({
        data: {
          resumeId: id,
          version: (latestVersion?.version || 0) + 1,
          resumeJson: updatedJson as any,
        },
      });

      await this.prisma.resume.update({
        where: { id },
        data: { currentVersion: newVersion.version },
      });
    }

    return this.prisma.resume.findUnique({
      where: { id },
      include: { template: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.resume.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) throw new NotFoundException('Resume not found');
    if (existing.userId !== userId) throw new ForbiddenException();

    return this.prisma.resume.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' as any },
    });
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findOne(id, userId);
    const latestVersion = (original as any).versions?.[0];

    const resume = await this.prisma.resume.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        targetRole: original.targetRole,
        experienceLevel: original.experienceLevel,
        industry: original.industry,
        templateId: original.templateId,
      },
    });

    await this.prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        version: 1,
        resumeJson: (latestVersion?.resumeJson || {}) as any,
      },
    });

    return this.prisma.resume.findUnique({
      where: { id: resume.id },
      include: { template: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }

  async getVersions(id: string, userId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.deletedAt) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    return this.prisma.resumeVersion.findMany({
      where: { resumeId: id },
      orderBy: { version: 'desc' },
    });
  }

  async restoreVersion(id: string, userId: string, version: number) {
    const resume = await this.prisma.resume.findUnique({ where: { id } });
    if (!resume || resume.deletedAt) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException();

    const versionData = await this.prisma.resumeVersion.findUnique({
      where: { resumeId_version: { resumeId: id, version } },
    });
    if (!versionData) throw new NotFoundException('Version not found');

    const latestVersion = await this.prisma.resumeVersion.findFirst({
      where: { resumeId: id },
      orderBy: { version: 'desc' },
    });

    const newVersion = await this.prisma.resumeVersion.create({
      data: {
        resumeId: id,
        version: (latestVersion?.version || 0) + 1,
        resumeJson: versionData.resumeJson as any,
      },
    });

    await this.prisma.resume.update({
      where: { id },
      data: { currentVersion: newVersion.version },
    });

    return this.prisma.resume.findUnique({
      where: { id },
      include: { template: true, versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
  }
}
