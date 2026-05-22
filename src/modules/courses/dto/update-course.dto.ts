import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CourseStatus } from 'src/generated/prisma/client';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;
}
