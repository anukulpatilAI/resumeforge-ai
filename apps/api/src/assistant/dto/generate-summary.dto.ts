import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateSummaryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  targetRole: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  yearsExperience: string;

  @ApiProperty()
  @IsString()
  skills: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentRole: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  projects?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  existingSummary?: string;

  @ApiProperty({ required: false, default: 'paragraph' })
  @IsOptional()
  @IsString()
  format?: string;
}
