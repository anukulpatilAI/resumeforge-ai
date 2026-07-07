import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RewriteExperienceDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  targetRole: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  role: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  company: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  achievements: string[];

  @ApiProperty({ required: false, default: 'bulletPoints' })
  @IsOptional()
  @IsString()
  format?: string;
}
