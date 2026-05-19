import { AbilityBuilder } from '@casl/ability';
import { CourseStatus, User } from 'src/generated/prisma/client';
import { Action } from '../actions.enum';
import { AppAbility, IPolicyHandler } from '../types';

export class InstructorPolicy implements IPolicyHandler {
  define({ can, cannot }: AbilityBuilder<AppAbility>, user: User): void {
    // course
    // can create course
    can(Action.Create, 'Course');

    // can read their own courses
    can(Action.Read, 'Course', { instructorId: user.id });

    // can read published courses
    can(Action.Read, 'Course', { status: CourseStatus.PUBLISHED });

    // can update their own courses
    can(Action.Update, 'Course', { instructorId: user.id });

    // can not delete courses if it is published or active
    cannot(Action.Delete, 'Course', {
      status: { in: [CourseStatus.PUBLISHED, CourseStatus.ARCHIVED] },
    });

    // Sections
    can(Action.Create, 'Section', {
      course: { instructorId: user.id },
    });
    can(Action.Read, 'Section', {
      course: { instructorId: user.id },
    });
    can(Action.Read, 'Section', {
      course: { status: CourseStatus.PUBLISHED },
    });
    can(Action.Update, 'Section', {
      course: { instructorId: user.id },
    });
    can(Action.Delete, 'Section', {
      course: { instructorId: user.id, status: CourseStatus.DRAFT },
    });

    // Lessons
    can(Action.Create, 'Lesson', {
      section: { course: { instructorId: user.id } },
    });
    can(Action.Read, 'Lesson', {
      section: { course: { instructorId: user.id } },
    });
    can(Action.Read, 'Lesson', {
      isPreview: true,
      section: { course: { status: CourseStatus.PUBLISHED } },
    });
    can(Action.Update, 'Lesson', {
      section: { course: { instructorId: user.id } },
    });
    can(Action.Delete, 'Lesson', {
      section: { course: { instructorId: user.id } },
    });
  }
}
