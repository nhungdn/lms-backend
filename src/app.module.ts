import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
    PrismaModule,
    ConfigModule.forRoot({ validationSchema: envValidationSchema }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
