import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAchievementsDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  targetRole: string;

  @ApiProperty()
  @IsString()
  skills: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  role: string;

  @ApiProperty()
  @IsString()
  context: string;

  @ApiProperty({ required: false, default: 'bulletPoints' })
  @IsOptional()
  @IsString()
  format?: string;
}
