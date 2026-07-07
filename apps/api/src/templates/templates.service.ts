import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.template.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.template.findUnique({ where: { id } });
  }

  async findFirst() {
    return this.prisma.template.findFirst({ where: { isActive: true } });
  }
}
