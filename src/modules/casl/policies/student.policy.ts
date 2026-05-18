import { AbilityBuilder } from '@casl/ability';
import { CourseStatus, User } from 'src/generated/prisma/client';
import { Action } from '../actions.enum';
import { AppAbility, IPolicyHandler } from '../types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentPolicy implements IPolicyHandler {
  define({ can }: AbilityBuilder<AppAbility>, user: User): void {
    // courses
    can(Action.Read, 'Course', {
      status: CourseStatus.PUBLISHED,
    });

    can(Action.Read, 'Course', {
      enrollments: { some: { userId: user.id } },
    });

    // sections
    can(Action.Read, 'Section', {
      course: {
        status: CourseStatus.PUBLISHED,
      },
    });

    can(Action.Read, 'Section', {
      course: {
        enrollments: { some: { userId: user.id } },
      },
    });

    // lessons
    can(Action.Read, 'Lesson', {
      section: {
        course: {
          enrollments: { some: { userId: user.id } },
        },
      },
    });

    can(Action.Read, 'Lesson', {
      isPreview: true,
      section: {
        course: {
          status: CourseStatus.PUBLISHED,
        },
      },
    });
  }
}
