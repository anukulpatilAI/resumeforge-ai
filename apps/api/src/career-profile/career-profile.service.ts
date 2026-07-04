import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateCareerProfileDto } from './dto/career-profile.dto';
import { CareerProfileData } from './interfaces/career-profile.interface';

@Injectable()
export class CareerProfileService {
  constructor(private prisma: PrismaService) {}

  private getDefaultProfile(): CareerProfileData {
    return {
      personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', photoUrl: '' },
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      languages: [],
      achievements: [],
      summary: '',
    };
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.careerProfile.findUnique({ where: { userId } });

    if (!profile) {
      return { userId, profile: this.getDefaultProfile() };
    }

    return { userId, profile: profile.profileJson as unknown as CareerProfileData };
  }

  async createOrUpdateProfile(userId: string, dto: UpdateCareerProfileDto) {
    const existing = await this.prisma.careerProfile.findUnique({ where: { userId } });

    if (existing) {
      const merged = this.mergeProfile(existing.profileJson as unknown as CareerProfileData, dto);

      const updated = await this.prisma.careerProfile.update({
        where: { userId },
        data: { profileJson: merged as any },
      });

      return { userId, profile: updated.profileJson as unknown as CareerProfileData };
    }

    const defaults = this.getDefaultProfile();
    const merged = this.mergeProfile(defaults, dto);

    const created = await this.prisma.careerProfile.create({
      data: { userId, profileJson: merged as any },
    });

    return { userId, profile: created.profileJson as unknown as CareerProfileData };
  }

  private mergeProfile(existing: CareerProfileData, dto: UpdateCareerProfileDto): CareerProfileData {
    return {
      personalInfo: { ...existing.personalInfo, ...dto.personalInfo },
      education: (dto.education ?? existing.education) as any,
      skills: (dto.skills ?? existing.skills) as any,
      experience: (dto.experience ?? existing.experience) as any,
      projects: (dto.projects ?? existing.projects) as any,
      certifications: (dto.certifications ?? existing.certifications) as any,
      languages: (dto.languages ?? existing.languages) as any,
      achievements: (dto.achievements ?? existing.achievements) as any,
      summary: dto.summary ?? existing.summary,
    };
  }
}
