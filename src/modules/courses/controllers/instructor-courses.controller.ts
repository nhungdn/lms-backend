import { Body, Controller, Param, Post } from '@nestjs/common';

import { CourseCommandService } from '../services/course-command.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Controller('instructor/courses')
export class InstructorCoursesController {
  constructor(private readonly courseCommandService: CourseCommandService) {}

  @Post()
  createDraft(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.courseCommandService.createDraft(dto, user);
  }

  @Post(':id')
  updateCourse(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.courseCommandService.updateCourse(id, dto, user);
  }
}
