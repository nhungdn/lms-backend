import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus } from 'src/generated/prisma/client';
import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dto/create-course.dto';
import { generateSlug } from 'src/common/utils/generate-slug';
import { User } from 'src/generated/prisma/client';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseCommandService {
  constructor(private readonly courseRepository: CourseRepository) {}

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

    if (course.instructorId !== user.id) {
      throw new ForbiddenException();
    }

    return this.courseRepository.update(courseId, dto);
  }
}
