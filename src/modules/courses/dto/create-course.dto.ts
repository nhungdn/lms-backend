import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsPositive,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsDecimal()
  @IsPositive()
  price!: number;
}
