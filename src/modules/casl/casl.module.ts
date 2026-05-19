import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './casl-ability.factory';
import { GuestPolicy } from './policies/guest.policy';
import { AdminPolicy } from './policies/admin.policy';
import { InstructorPolicy } from './policies/instructor.policy';
import { StudentPolicy } from './policies/student.policy';

@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
