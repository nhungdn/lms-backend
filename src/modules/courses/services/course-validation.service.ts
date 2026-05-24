import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CourseValidationService {
  validateBeforePublish(course: any) {
    if (!course.thumbnailUrl) {
      throw new BadRequestException('Thumbnail is required');
    }

    if (!course.sections.length) {
      throw new BadRequestException('Course must have sections');
    }
  }
}
