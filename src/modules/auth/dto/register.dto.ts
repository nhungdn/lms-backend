import { IsEmail, IsString, MinLength } from 'class-validator';
import { Role } from 'src/generated/prisma/client';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsString()
  firstname!: string;

  @IsString()
  lastname!: string;

  @IsString()
  role!: Role;
}
