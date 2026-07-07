import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import ReactPDF from '@react-pdf/renderer';
import { ResumeService } from '../resume/resume.service';
import { TemplatesService } from '../templates/templates.service';
import { PrismaService } from '../database/prisma.service';
import { ResumePDF } from './resume-pdf';
import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { cwd } from 'process';

@Injectable()
export class PdfService {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly templatesService: TemplatesService,
    private readonly prisma: PrismaService,
  ) {}

  async generatePdf(
    resumeId: string,
    userId: string,
    options?: { format?: 'A4' | 'LETTER' },
  ) {
    const resume = await this.resumeService.findOne(resumeId, userId);
    if (!resume) throw new NotFoundException('Resume not found');

    const latestVersion = resume.versions?.[0];
    if (!latestVersion) throw new NotFoundException('No versions found for this resume');

    const resumeJson = latestVersion.resumeJson as Record<string, unknown>;
    if (!resumeJson || !resumeJson.sections) {
      throw new BadRequestException('Resume JSON is empty or has no sections');
    }

    let template: any = null;
    if (resume.template?.id) {
      template = await this.templatesService.findOne(resume.template.id);
    } else if (resumeJson?.templateId) {
      template = await this.templatesService.findOne(resumeJson.templateId as string);
    }

    if (!template) {
      const fallback = await this.templatesService.findFirst();
      template = fallback;
    }

    const element = React.createElement(ResumePDF, { resumeJson, template });

    const uploadsDir = path.join(cwd(), 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${resumeId}-v${latestVersion.version}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);

    try {
      const buffer = await ReactPDF.renderToBuffer(element);
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      throw new InternalServerErrorException('Failed to generate PDF: ' + (err as Error).message);
    }

    const record = await this.prisma.generatedPDF.create({
      data: {
        resumeId,
        version: latestVersion.version,
        fileUrl: `/uploads/pdfs/${filename}`,
      },
    });

    return { url: record.fileUrl, id: record.id, version: latestVersion.version };
  }

  async getPdfRecord(pdfId: string) {
    return this.prisma.generatedPDF.findUnique({ where: { id: pdfId } });
  }
}
