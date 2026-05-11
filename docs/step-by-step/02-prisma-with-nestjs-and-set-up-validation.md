# Integrate Prisma with NestJS and set up environment validation

---

## Tree directory

```
src/
├── common/             # Global filters, interceptors, decorators
├── config/             # env config, validation schema
├── modules/            # domain modules (auth, users...)
├── prisma/             # Prisma service and logic database
└── app.module.ts
```

## Configuration & Env Validation

We should validate environment variables in `.env` file before start up, because `.env` itself can not check if a PORT is a number...

- To validate, we use `joi`:

  ```
  npm install @nestjs/config joi
  ```

- In `src/config/env.validation.ts` file:

  ```typescript
  import * as Joi from 'joi';

  export const envValidationSchema = Joi.object({
    DB_USER: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_NAME: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DATABASE_URL: Joi.string().required(),
    PORT: Joi.number().default(3000),
  });
  ```

  In `Joi.object()`, you can add any variables you want to validate.

- Import into `AppModule` using `forRoot()` function:

  ```typescript
  ConfigModule.forRoot({ validationSchema: envValidationSchema });
  ```

## Global Validation Pipe

Install `class-validator` and `class-transformer`:

```
npm install class-validator class-transformer
```

In `main.ts` file:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // remove properties that do not have any decorators
    forbidNonWhitelisted: true, // throw an error if non-whitelisted properties are present
    transform: true, // automatically transform payloads to be objects typed according to their DTO classes
  }),
);
```

## Common Layer

This layer is essential for making your API look professional, consistent, and easy to maintain. It serves as the "backbone" that handles repetitive tasks across all endpoints.

1. **Response Formatter**
   - ensures every API call returns a predictable structure, regardless of whether it succeeded or failed.
   - In `src/common/interceptors/transform.interceptor.ts`

   ```typescript
   import {
     Injectable,
     NestInterceptor,
     ExecutionContext,
     CallHandler,
   } from '@nestjs/common';
   import { Observable } from 'rxjs';
   import { map } from 'rxjs/operators';

   export interface Response<T> {
     statusCode: number;
     message: string;
     data: T;
   }

   @Injectable()
   export class TransformInterceptor<T> implements NestInterceptor<
     T,
     Response<T>
   > {
     intercept(
       context: ExecutionContext,
       next: CallHandler,
     ): Observable<Response<T>> {
       return next.handle().pipe(
         map((data) => ({
           statusCode: context.switchToHttp().getResponse().statusCode,
           message: data?.message || 'Success',
           data: data?.result || data || null,
         })),
       );
     }
   }
   ```

2. **Exception Filter**
   - manages errors so the API doesn't crash or return messy stack traces to the end user, transforms internal errors into user-friendly messages.
   - In `src/common/filters/http-exception.filter.ts`

   ```typescript
   import {
     ExceptionFilter,
     Catch,
     ArgumentsHost,
     HttpException,
     HttpStatus,
   } from '@nestjs/common';

   @Catch()
   export class AllExceptionsFilter implements ExceptionFilter {
     catch(exception: any, host: ArgumentsHost) {
       const ctx = host.switchToHttp();
       const response = ctx.getResponse();
       const request = ctx.getRequest();

       const status =
         exception instanceof HttpException
           ? exception.getStatus()
           : HttpStatus.INTERNAL_SERVER_ERROR;

       const message =
         exception instanceof HttpException
           ? exception.getResponse()
           : 'Internal server error';

       response.status(status).json({
         statusCode: status,
         timestamp: new Date().toISOString(),
         path: request.url,
         message:
           typeof message === 'object' ? (message as any).message : message,
       });
     }
   }
   ```

3. **Logger Interceptor**
   - automatically records log when receive a request (who called which API, when it happened, how long it took)
   - In `src/common/interceptors/logger.interceptor.ts`

   ```typescript
   import {
     Injectable,
     NestInterceptor,
     ExecutionContext,
     CallHandler,
     Logger,
   } from '@nestjs/common';
   import { Observable } from 'rxjs';
   import { tap } from 'rxjs/operators';

   @Injectable()
   export class LoggingInterceptor implements NestInterceptor {
     private readonly logger = new Logger('HTTP');

     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
       const request = context.switchToHttp().getRequest();
       const { method, url } = request;
       const now = Date.now();

       return next.handle().pipe(
         tap(() => {
           const response = context.switchToHttp().getResponse();
           const delay = Date.now() - now;
           this.logger.log(
             `${method} ${url} ${response.statusCode} - ${delay}ms`,
           );
         }),
       );
     }
   }
   ```

### Apply all of these in `main.ts`

```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalFilters(new AllExceptionsFilter());
```

## API versioning

A version can be applied to a controller, setting the version for all routes within the controller.

```typescript
@Controller({
  path: 'users', // your path name
  version: '3', // your version
})
```

A version can be applied to an individual route. This version will override any other version that would effect the route, such as the Controller Version.

```typescript
@Controller()
export class CatsController {
  @Version('1')
  @Get('cats')
  findAllV1(): string {}
}
```

To enable URI Versioning for your application, do the following in `main.ts` file:

```typescript
app.enableVersioning({
  type: VersioningType.URI,
});
```

## Create doamin modules

```
nest g mo modules/auth
nest g mo modules/users
nest g mo modules/courses
nest g mo modules/lessons
nest g mo modules/enrollments
```

After running these commands, you can see a `*.module.ts` file in each folder.

## Prisma module

Prisma Postgres integrates perfectly with NestJS's dependency injection system and modular architecture. By creating a PrismaService that extends the PrismaClient, you can inject database access throughout your application.

- In `src/prisma/prisma.service.ts` file:

  ```typescript
  import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
  import { PrismaPg } from '@prisma/adapter-pg';
  import { PrismaClient } from '../generated/prisma/client';

  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
  {
    constructor() {
      super({
        adapter: new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        }),
      });
    }

    async onModuleInit() {
      await this.$connect();
    }

    async onModuleDestroy() {
      await this.$disconnect();
    }
  }
  ```

- In `src/prisma/prisma.module.ts`

  ```typescript
  import { Module, Global } from '@nestjs/common';
  import { PrismaService } from './prisma.service';

  @Global()
  @Module({
    providers: [PrismaService],
    exports: [PrismaService],
  })
  export class PrismaModule {}
  ```

- Then, import `PrismaModule` in `app.module.ts` and you can use `PrismaService` without importing it in other modules.

## Test with User

1. In `src/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() data: { name: string; email: string }) {
    return this.usersService.create(data);
  }
}
```

2. In `src/users/users.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: { name: string; email: string }) {
    return this.prisma.user.create({ data });
  }
}
```

2. Run the app

```
npm run start:dev
```

3. Test `GET http://localhost:3000/v1/users`, will reveice the user we add in `01-getting-satrted`:

```
{
    "statusCode": 200,
    "message": "Success",
    "data": [
        {
            "id": 1,
            "email": "test@gmail.com",
            "name": "John"
        }
    ]
}
```

In terminal, there will be a LOG line: LOG [HTTP] GET /v1/users 200 - 81ms

4. Test create new user

Request:

```
POST http://localhost:3000/v1/users

{
  "name": "Tom",
  "email": "tom@gmail.com"
}
```

Response:

```
{
    "statusCode": 201,
    "message": "Success",
    "data": {
        "id": 3,
        "email": "tom@gmail.com",
        "name": "Tom"
    }
}
```

Log in terminal: LOG [HTTP] POST /v1/users 201 - 15ms

---

# Read more in

---

- [How Prisma Postgres and NestJS fit together | Prisma Docs](https://www.prisma.io/nestjs)
- [Configuration | NestJS Docs](https://docs.nestjs.com/techniques/configuration)
- [Validation | NesJS Docs](https://docs.nestjs.com/techniques/validation)
- [Versioning | NesJS Docs](https://docs.nestjs.com/techniques/versioning)
- [Prisma | NestJS Docs](https://docs.nestjs.com/recipes/prisma)
