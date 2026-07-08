import { IsString, IsObject, IsOptional } from 'class-validator';

export class MatchJdDto {
  @IsObject()
  sections: Record<string, any>;

  @IsString()
  jobDescription: string;

  @IsOptional()
  @IsString()
  targetRole?: string;
}
