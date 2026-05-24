import { AbilityBuilder } from '@casl/ability';
import { AppAbility, IPolicyHandler } from '../types';
import { User } from 'src/generated/prisma/browser';
import { Action } from '../actions.enum';

export function defineAdminAbilities(
  builder: AbilityBuilder<AppAbility>,
  user: User,
) {
  const { can } = builder;
  can(Action.Manage, 'all');
}
