import { AbilityBuilder } from '@casl/ability';
import { AppAbility, IPolicyHandler } from '../types';
import { Action } from '../actions.enum';

export function defineGuestAbilities(builder: AbilityBuilder<AppAbility>) {
  const { can } = builder;
  // can read published courses
  can(Action.Read, 'Course', { isPublished: true });

  // can read sections of published courses
  can(Action.Read, 'Section', { course: { is: { isPublished: true } } });

  // can read preview lessons of published courses
  can(Action.Read, 'Lesson', {
    is: { isPreviewed: true },
    section: {
      is: {
        course: { is: { isPublished: true } },
      },
    },
  });
}
