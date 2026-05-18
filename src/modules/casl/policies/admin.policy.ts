import { AbilityBuilder } from '@casl/ability';
import { AppAbility, IPolicyHandler } from '../types';
import { User } from 'src/generated/prisma/browser';
import { Action } from '../actions.enum';

export class AdminPolicy implements IPolicyHandler {
  define({ can }: AbilityBuilder<AppAbility>, user: User): void {
    can(Action.Manage, 'all');
  }
}
