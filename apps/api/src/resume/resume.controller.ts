import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { CreateResumeDto, UpdateResumeDto } from './dto/resume.dto';

@ApiTags('Resumes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'resumes', version: '1' })
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.resumeService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.resumeService.findOne(id, req.user.id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateResumeDto) {
    try {
      return await this.resumeService.create(req.user.id, dto);
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      const stack = err?.stack || '';
      console.error('Resume create error:', msg, stack);
      throw new InternalServerErrorException(msg);
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateResumeDto) {
    return this.resumeService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.resumeService.remove(id, req.user.id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Req() req: any) {
    return this.resumeService.duplicate(id, req.user.id);
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string, @Req() req: any) {
    return this.resumeService.getVersions(id, req.user.id);
  }

  @Post(':id/restore/:version')
  restoreVersion(@Param('id') id: string, @Param('version') version: string, @Req() req: any) {
    return this.resumeService.restoreVersion(id, req.user.id, parseInt(version));
  }
}
