import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSectionDto) {
    return this.prisma.section.create({
      data: {
        title: data.title,
        order: data.order,
        course: { connect: { id: data.courseId } },
      },
    });
  }

  async findAll(courseId?: string) {
    const where = courseId ? { where: { courseId } } : undefined;
    return this.prisma.section.findMany();
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, dto: UpdateSectionDto) {
    return this.prisma.section.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.section.delete({ where: { id } });
  }
}
