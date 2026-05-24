import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CourseCommandService } from '../services/course-command.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CheckPolicies } from 'src/modules/casl/decorators/check-policies.decorator';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PoliciesGuard } from 'src/modules/casl/guards/policies.guard';
import { Action } from 'src/modules/casl/actions.enum';

@Controller({ version: '1', path: 'instructor/courses' })
export class InstructorCoursesController {
  constructor(private readonly courseCommandService: CourseCommandService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Course'))
  createDraft(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.courseCommandService.createDraft(dto, user);
  }

  @Patch(':id')
  updateCourse(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.courseCommandService.updateCourse(id, dto, user);
  }

  @Post(':id/publish')
  publishCourse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.courseCommandService.publish(id, user);
  }

  @Post(':id/archive')
  archiveCourse(@Param('id') id: string, @CurrentUser() user: any) {
    return this.courseCommandService.archive(id, user);
  }

  @Get()
  viewMyCourses(@CurrentUser() user: any) {
    return this.courseCommandService.viewMyCourses(user);
  }
}
