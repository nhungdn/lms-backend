import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CourseValidationService } from './course-validation.service';

@Injectable()
export class CoursePublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: CourseValidationService,
  ) {}

  async publish(courseId: string, user: User) {
    // find course with sections and lessons
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },

      include: {
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException();
    }

    // only instructor can publish their course
    if (course.instructorId !== user.id) {
      throw new ForbiddenException();
    }

    // validate course before publish
    this.validationService.validateBeforePublish(course);

    return this.prisma.course.update({
      where: {
        id: courseId,
      },

      data: {
        status: 'PUBLISHED',
      },
    });
  }
}
