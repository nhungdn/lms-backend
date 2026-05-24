import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseQueryService {
  constructor(private readonly prisma: PrismaService) {}

  getPublishedCourses() {
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },

      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        price: true,
      },
    });
  }
}
