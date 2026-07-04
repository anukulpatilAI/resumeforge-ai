import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CareerProfileModule } from './career-profile/career-profile.module';
import { UploadModule } from './upload/upload.module';
import { ResumeModule } from './resume/resume.module';
import { TemplatesModule } from './templates/templates.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }), DatabaseModule, AuthModule, CareerProfileModule, UploadModule, ResumeModule, TemplatesModule],
  controllers: [HealthController],
})
export class AppModule {}
