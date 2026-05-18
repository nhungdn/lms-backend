import { SetMetadata } from '@nestjs/common';
import { PolicyHandlerCallback } from '../types';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
