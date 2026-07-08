import { IsString, IsObject, IsOptional } from 'class-validator';

export class ApplyAtsDto {
  @IsObject()
  sections: Record<string, any>;

  @IsString()
  suggestionType: string;

  @IsOptional()
  @IsString()
  suggestionSection?: string;

  @IsOptional()
  @IsString()
  value?: string;
}
