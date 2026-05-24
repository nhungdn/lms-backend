import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { User, Course, Section, Lesson } from 'src/generated/prisma/client';
import { Action } from './actions.enum';

type AppSubjects =
  | Subjects<{
      User: User;
      Course: Course;
      Section: Section;
      Lesson: Lesson;
    }>
  | 'all';

export type AppAbility = PureAbility<[Action, AppSubjects], PrismaQuery>;

export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

export type PolicyHandlerCallback = (ability: AppAbility) => boolean;
