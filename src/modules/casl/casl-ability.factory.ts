import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Role, User } from 'src/generated/prisma/client';
import { AppAbility, IPolicyHandler } from './types';
import { InstructorPolicy } from './policies/instructor.policy';
import { StudentPolicy } from './policies/student.policy';
import { AdminPolicy } from './policies/admin.policy';

@Injectable()
export class CaslAbilityFactory {
  // Map each role to its corresponding policy handler class
  private readonly policyMap: Record<Role, new () => IPolicyHandler> = {
    [Role.ADMIN]: AdminPolicy,
    [Role.INSTRUCTOR]: InstructorPolicy,
    [Role.STUDENT]: StudentPolicy,
  };

  createForUser(user: User): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const PolicyClass = this.policyMap[user.role];

    if (PolicyClass) {
      const handler = new PolicyClass();
      handler.define(builder, user);
    }

    return builder.build();
  }
}
