import { IsString, IsOptional, IsObject } from 'class-validator';

export class AnalyzeAtsDto {
  @IsString()
  resumeId: string;

  @IsObject()
  sections: Record<string, any>;

  @IsOptional()
  @IsString()
  targetRole?: string;
}
