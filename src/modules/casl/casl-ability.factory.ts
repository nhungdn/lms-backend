import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Role, User } from 'src/generated/prisma/client';
import { AppAbility, IPolicyHandler } from './types';
import { defineGuestAbilities } from './policies/guest.policy';
import { defineAdminAbilities } from './policies/admin.policy';
import { defineInstructorAbilities } from './policies/instructor.policy';
import { defineStudentAbilities } from './policies/student.policy';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user?: User): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    if (!user) {
      // no authenticated user -> guest abilities
      defineGuestAbilities(builder);
      return builder.build();
    }

    switch (user.role) {
      case Role.ADMIN:
        defineAdminAbilities(builder, user);
        break;

      case Role.INSTRUCTOR:
        defineInstructorAbilities(builder, user);
        break;

      case Role.STUDENT:
        defineStudentAbilities(builder, user);
        break;
    }

    return builder.build();
  }
}
