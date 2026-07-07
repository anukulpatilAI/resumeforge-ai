import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateProjectDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  projectName: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  domain: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  techStack: string[];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  targetRole: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  careerContext?: string;

  @ApiProperty({ required: false, default: 'paragraph' })
  @IsOptional()
  @IsString()
  format?: string;
}
