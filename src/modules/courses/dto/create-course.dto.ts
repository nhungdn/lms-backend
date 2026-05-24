import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(20)
  description!: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsUUID()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  price!: number;
}
