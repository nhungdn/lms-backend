import { Module } from '@nestjs/common';
import { CourseRepository } from './repositories/course.repository';
import { CourseValidationService } from './services/course-validation.service';
import { InstructorCoursesController } from './controllers/instructor-courses.controller';
import { CourseCommandService } from './services/course-command.service';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [CaslModule],
  controllers: [InstructorCoursesController],
  providers: [CourseCommandService, CourseValidationService, CourseRepository],
})
export class CoursesModule {}
