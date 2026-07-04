import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CareerProfileService } from './career-profile.service';
import { UpdateCareerProfileDto } from './dto/career-profile.dto';

@ApiTags('career-profile')
@Controller({ path: 'career-profile', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerProfileController {
  constructor(private service: CareerProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user career profile' })
  getProfile(@Request() req: any) {
    return this.service.getProfile(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or replace career profile' })
  createProfile(@Request() req: any, @Body() dto: UpdateCareerProfileDto) {
    return this.service.createOrUpdateProfile(req.user.id, dto);
  }

  @Put()
  @ApiOperation({ summary: 'Update career profile (merges with existing)' })
  updateProfile(@Request() req: any, @Body() dto: UpdateCareerProfileDto) {
    return this.service.createOrUpdateProfile(req.user.id, dto);
  }
}
