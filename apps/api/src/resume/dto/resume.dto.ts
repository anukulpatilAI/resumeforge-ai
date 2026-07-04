import { IsString, IsOptional, IsArray, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SectionVisibilityDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  visible?: boolean;
}

class ResumeSectionsDto {
  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  personal?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  summary?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  education?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  skills?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  experience?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  projects?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  certifications?: SectionVisibilityDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SectionVisibilityDto)
  @IsOptional()
  languages?: SectionVisibilityDto;
}

class ResumeMetadataDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetRole?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  selectedColorScheme?: string;
}

export class CreateResumeDto {
  @ApiPropertyOptional({ default: 'My Resume' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetRole?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;
}

export class UpdateResumeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetRole?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  experienceLevel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  sections?: ResumeSectionsDto;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: ResumeMetadataDto;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  sectionOrder?: string[];
}
