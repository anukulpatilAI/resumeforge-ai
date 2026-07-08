import { IsString, IsOptional, IsObject } from 'class-validator';

export class AiRewriteDto {
  @IsString()
  suggestionType: string;

  @IsObject()
  sections: Record<string, any>;

  @IsOptional()
  @IsString()
  targetRole?: string;
}
