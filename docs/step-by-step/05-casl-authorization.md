# Authorization using CASL

---

## Install dependency

```
npm install @casl/ability @casl/prisma
```

## Define policies

### Create `casl` module

```
nest g module modules/casl
```

### Define action

Create [`actions.enum.ts`](/src/modules/casl/actions.enum.ts) file:

```typescript
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}
```

### Define policies

- Create interface `IPolicyHandler` in [`types.ts`](/src/modules/casl/types.ts). if a role has policies, it will implements `IPolicyHandler`.
- Create `GuestPolicy`, `AdminPolicy`, `InstructorPolicy`, `StudentPolicy` implements `IPolicyHandler` in [`policies`](/src/modules/casl/policies/) directory.
- In [`casl-ability.factory.ts`](/src/modules/casl/casl-ability.factory.ts), define `createForUser()` method to create the `Ability` object for a given user.
- Then, add `CaslAbilityFactory` to the `providers` and `exports` arrays in the CaslModule module definition:

  ```typescript
  import { Module } from '@nestjs/common';
  import { CaslAbilityFactory } from './casl-ability.factory';

  @Module({
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory],
  })
  export class CaslModule {}
  ```

### PoliciesGuard

`PoliciesGurad` will check if a user meet specific authorization policies that can be configured on method-level.
The goal is to provide a mechanism that allow specifying policies check per route handler.

- Defining a policy handler, I choose using a function, which meets the `PolicyHandleCallback` type

  ```typescript
  // src/modules/casl/type.ts
  export type PolicyHandlerCallback = (ability: AppAbility) => boolean;
  ```

- Create `@CheckPolicies()` decorator, it allows specifying what policies have to be met to access specific resources.

  ```typescript
  // src/modules/casl/decorators/check-policies.decorator.ts
  import { SetMetadata } from '@nestjs/common';
  import { PolicyHandlerCallback } from '../types';

  export const CHECK_POLICIES_KEY = 'check_policy';
  export const CheckPolicies = (...handlers: PolicyHandlerCallback[]) =>
    SetMetadata(CHECK_POLICIES_KEY, handlers);
  ```

- Now let's create a [`PoliciesGuard`](/src/modules/casl/guards/policies.guard.ts) that will extract and execute all the policy handlers bound to a route handler
- Finally, to test this guard, bind it to any route handler, and register an inline policy handler (functional approach), as this example:

  ```typescript
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
  findAll() {
    return this.articlesService.findAll();
  }
  ```

# Read more in

- [Authorization - NestJS Docs](https://docs.nestjs.com/security/authorization)
- [CASL Intro - CASL Docs](https://casl.js.org/v6/en/guide/intro)
- [CASL Prisma - CASL Docs](https://casl.js.org/v6/en/package/casl-prisma#casl-prisma)
