import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePdfDto {
  @ApiPropertyOptional({ enum: ['A4', 'LETTER'], default: 'A4' })
  @IsOptional()
  @IsIn(['A4', 'LETTER'])
  format?: 'A4' | 'LETTER';
}
