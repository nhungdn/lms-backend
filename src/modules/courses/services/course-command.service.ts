import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus, User } from 'src/generated/prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { generateSlug } from 'src/common/utils/generate-slug';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CaslAbilityFactory } from 'src/modules/casl/casl-ability.factory';
import { Action } from 'src/modules/casl/actions.enum';
import { ForbiddenError, subject } from '@casl/ability';
import { CourseValidationService } from './course-validation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly validationService: CourseValidationService,
    private readonly courseRepository: CourseRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async createDraft(dto: CreateCourseDto, user: User) {
    const slug = generateSlug(dto.title);
    return this.courseRepository.create({
      title: dto.title,
      description: dto.description,
      slug,
      price: dto.price,
      category: {
        connect: {
          id: dto.categoryId,
        },
      },
      instructor: {
        connect: {
          id: user.id,
        },
      },
      status: CourseStatus.DRAFT,
    });
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto, user: User) {
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // check if user can update this course
    const ability = this.caslAbilityFactory.createForUser(user);

    if (!ability.can(Action.Update, subject('Course', course))) {
      throw new ForbiddenException(
        'You do not have permission to update this course',
      );
    }

    return this.courseRepository.update(courseId, dto);
  }

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
      throw new NotFoundException('Course not found');
    }

    // check if user can publish this course
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Publish, subject('Course', course))) {
      throw new ForbiddenException(
        'You do not have permission to publish this course',
      );
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

  async archive(courseId: string, user: User) {
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // check if user can archive this course
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can(Action.Archive, subject('Course', course))) {
      throw new ForbiddenException(
        'You do not have permission to archive this course',
      );
    }

    // check status
    if (course.status === CourseStatus.ARCHIVED) {
      throw new BadRequestException('Course already archived');
    }

    return this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        status: 'ARCHIVED',
      },
    });
  }

  viewMyCourses(user: User) {
    if (user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only instructors can view their courses');
    }

    return this.prisma.course.findMany({
      where: {
        instructorId: user.id,
      },
    });
  }
}
