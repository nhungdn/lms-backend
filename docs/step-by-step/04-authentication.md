# Authentication

---

## Refersh token table

Add `RefreshToken` to store refresh token in prisma schema:

```prisma
model RefreshToken {
id          String   @id @default(uuid())

tokenHash   String

userId      String
user        User @relation(fields: [userId], references: [id], onDelete: Cascade)

expiresAt   DateTime
revoked     Boolean @default(false)

createdAt   DateTime @default(now())

@@index([userId])
}
```

Then run prisma migrate command to apply new schema.

**Note:** We store refresh token to:

- logout device
- revoke token
- detect reuse attack
- logout all devices

## Auth directory

```
src/
  modules/
    auth/
      controllers/
      services/
      dto/
      guards/
      strategies/
      interfaces/
```

## Register

- Install `bcrypt` library to help you hash password:

  ```
  npm install bcrypt
  ```

- Create `RegisterDto` in [`register.dto.ts`](/src/modules/auth/dto/register.dto.ts).
- Create register service [`auth.service.ts`](/src/modules/auth/auth.service.ts).
- Add route register in [`auth.controller.ts`](/src/modules/auth/auth.controller.ts).

### Test

```
POST http://localhost:3000/v1/auth/register
```

![Register test](/docs/images/register-test.png)

## Login

### Dependencies

```
npm install @nestjs/jwt @nestjs/passport passport passport-local passport-jwt cookie-parser
npm install -D @types/passport-local @types/cookie-parser
```

- `passport` is a nodejs authentication libary, it has a rich ecosystem of strategies that implement various authentication mechanisms.
- `passport-local` and `passport-jwt` are passport strategies
- `cookie-parser` is used to read cookies

### Environment variables

In `.env` file:

```
JWT_ACCESS_SECRET=your_super_access_secret
JWT_REFRESH_SECRET=your_super_refresh_secret

ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
```

### Set up cookies parser

In `main.ts`:

```typescript
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // add
  // ...

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### JWT Module

Import `JwtModule` in `auth.module.ts`:

```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('ACCESS_TOKEN_EXPIRES'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

Now, we can use `JwtService` in other modules by import `AuthModule`

### Passport local

- Create `LoginDto` in [`login.dto.ts`](/src/modules/auth/dto/login.dto.ts).
- Create login service [`auth.service.ts`](/src/modules/auth/auth.service.ts).
- Create `LocalStrategy` in [`local.strategy.ts`](/src/modules/auth/strategies/local.strategy.ts) and configure `AuthModule` to use the passport features:

  ```typescript
  @Module({
    //...
    providers: [LocalStrategy], // add
  })
  export class AuthModule {}
  ```

- Create LocalAuthGuard in [`local-auth.guard.ts`](/src/modules/auth/guards/local-auth.guard.ts)

  ```typescript
  import { Injectable } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';

  @Injectable()
  export class LocalAuthGuard extends AuthGuard('local') {}
  ```

- Add route login in [`auth.controller.ts`](/src/modules/auth/auth.controller.ts).

  ```typescript
  export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req, @Body() loginDto: LoginDto) {
      const tokens = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      return {
        accessToken: tokens.accessToken,
      };
    }
  }
  ```

### Passport JWT

- Create `JwtStrategy` in [`jwt.strategy.ts`](/src/modules/auth/strategies/jwt.strategy.ts)
- Register JwtStrategy in [`auth.module.ts](/src/modules/auth/auth.module.ts)

Do the same with `JwtRefreshStratery`.

## Refresh token

- We have set up above, now add set up refresh token logic in [`auth.service.ts`](/src/modules/auth/auth.service.ts):

  ```typescript
  async refreshTokens(userId: string, refreshToken: string) {
      const userTokens = await this.prisma.refreshToken.findMany({
        where: {
          userId: userId,
          revoked: false,
          expiresAt: { gte: new Date() }, // unexpired tokens only
        },
      });

      let validTokenRecord: any = null;
      for (const tokenRecord of userTokens) {
        const isMatched = await bcrypt.compare(
          refreshToken,
          tokenRecord.tokenHash,
        );
        if (isMatched) {
          validTokenRecord = tokenRecord;
          break;
        }
      }

      if (!validTokenRecord) {
        throw new UnauthorizedException('Access Denied / Invalid Refresh Token');
      }

      // revoke the used refresh token (refresh token rotation)
      await this.prisma.refreshToken.update({
        where: { id: validTokenRecord.id },
        data: { revoked: true },
      });

      // generate new tokens
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user.id, user.role);
    }
  ```

- Create `/refresh` endpoint in [`auth.controller.ts`](/src/modules/auth/auth.controller.ts):

  ```typescript
    @UseGuards(JwtRefreshAuthGuard)
    @Post('refresh')
    async refresh(@Request() req) {
      const userId = req.user.userId;
      const refreshToken = req.user.refreshToken;

      return await this.authService.refreshTokens(userId, refreshToken);
    }
  ```
