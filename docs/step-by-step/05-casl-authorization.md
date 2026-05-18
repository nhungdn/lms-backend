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

# Read more in

- [Authorization - NestJS Docs](https://docs.nestjs.com/security/authorization)
- [CASL Intro - CASL Docs](https://casl.js.org/v6/en/guide/intro)
- [CASL Prisma - CASL Docs](https://casl.js.org/v6/en/package/casl-prisma#casl-prisma)
