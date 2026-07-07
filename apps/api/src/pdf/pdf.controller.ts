import { Controller, Post, Get, Param, UseGuards, Req, Res, Body, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PdfService } from './pdf.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { cwd } from 'process';

@ApiTags('PDF')
@Controller({ path: 'resumes/:id/pdf', version: '1' })
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiBody({ type: GeneratePdfDto, required: false })
  async generate(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: GeneratePdfDto,
  ) {
    const result = await this.pdfService.generatePdf(id, req.user.id, dto);
    return { url: result.url, id: result.id };
  }

  @Get('download/:pdfId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async download(
    @Param('id') id: string,
    @Param('pdfId') pdfId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const record = await this.pdfService.getPdfRecord(pdfId);
    if (!record || record.resumeId !== id) {
      throw new NotFoundException('PDF not found');
    }
    const filePath = path.join(cwd(), record.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('PDF file not found on disk');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="resume-v${record.version}.pdf"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
