import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AtsService } from './ats.service';
import { AnalyzeAtsDto } from './dto/analyze-ats.dto';
import { ApplyAtsDto } from './dto/apply-ats.dto';
import { AiRewriteDto } from './dto/ai-rewrite.dto';
import { MatchJdDto } from './dto/match-jd.dto';

@ApiTags('ATS')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'ats', version: '1' })
export class AtsController {
  constructor(private readonly atsService: AtsService) {}

  @Post('analyze')
  async analyze(@Body() dto: AnalyzeAtsDto) {
    const targetRole = dto.targetRole || undefined;
    return this.atsService.analyze(dto.sections, targetRole, dto.resumeId);
  }

  @Post('apply')
  async apply(@Body() dto: ApplyAtsDto) {
    const updated = await this.atsService.applySuggestion(
      dto.sections,
      dto.suggestionType,
      dto.suggestionSection,
      dto.value,
    );
    return { sections: updated };
  }

  @Post('match-jd')
  async matchJd(@Body() dto: MatchJdDto) {
    return this.atsService.matchWithJd(dto.sections, dto.jobDescription, dto.targetRole);
  }

  @Post('rewrite')
  async aiRewrite(@Body() dto: AiRewriteDto) {
    return this.atsService.aiRewrite(dto.suggestionType, dto.sections, dto.targetRole);
  }
}
