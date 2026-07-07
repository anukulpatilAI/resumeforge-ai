import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { ResumeModule } from '../resume/resume.module';
import { DatabaseModule } from '../database/database.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [ResumeModule, DatabaseModule, TemplatesModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
