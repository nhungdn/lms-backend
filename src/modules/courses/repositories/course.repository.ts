import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/browser';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }
}
