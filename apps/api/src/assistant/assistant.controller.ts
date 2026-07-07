import { Controller, Post, Body, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssistantService } from './assistant.service';
import { GenerateSummaryDto } from './dto/generate-summary.dto';
import { RewriteExperienceDto } from './dto/rewrite-experience.dto';
import { GenerateProjectDto } from './dto/generate-project.dto';
import { GenerateAchievementsDto } from './dto/generate-achievements.dto';

@ApiTags('assistant')
@ApiBearerAuth()
@Controller({ path: 'assistant', version: '1' })
@UseGuards(AuthGuard('jwt'))
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate professional summary with AI' })
  async generateSummary(@Body() body: GenerateSummaryDto) {
    try {
      return await this.assistant.generateSummary(body);
    } catch (e) {
      throw new InternalServerErrorException(e instanceof Error ? e.message : 'AI service unavailable');
    }
  }

  @Post('rewrite-experience')
  @ApiOperation({ summary: 'Rewrite experience bullet points with AI' })
  async rewriteExperience(@Body() body: RewriteExperienceDto) {
    try {
      return await this.assistant.rewriteExperience(body);
    } catch (e) {
      throw new InternalServerErrorException(e instanceof Error ? e.message : 'AI service unavailable');
    }
  }

  @Post('generate-project')
  @ApiOperation({ summary: 'Generate project description with AI' })
  async generateProject(@Body() body: GenerateProjectDto) {
    try {
      return await this.assistant.generateProject(body);
    } catch (e) {
      throw new InternalServerErrorException(e instanceof Error ? e.message : 'AI service unavailable');
    }
  }

  @Post('generate-achievements')
  @ApiOperation({ summary: 'Generate achievement bullet points with AI' })
  async generateAchievements(@Body() body: GenerateAchievementsDto) {
    try {
      return await this.assistant.generateAchievements(body);
    } catch (e) {
      throw new InternalServerErrorException(e instanceof Error ? e.message : 'AI service unavailable');
    }
  }
}
