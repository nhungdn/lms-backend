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
