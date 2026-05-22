import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        title: data.title,
        type: data.type,
        videoUrl: data.videoUrl,
        content: data.content,
        duration: data.duration,
        order: data.order,
        isPreview: data.isPreview,
        section: { connect: { id: data.sectionId } },
      },
    });
  }

  async findAll(sectionId?: string) {
    const where = sectionId ? { where: { sectionId } } : undefined;
    return this.prisma.lesson.findMany();
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async update(id: string, dto: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }
}
