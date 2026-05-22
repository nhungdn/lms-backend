import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { LessonType } from 'src/generated/prisma/client';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(LessonType)
  type!: LessonType;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  duration!: number;

  @IsInt()
  order!: number;

  @IsBoolean()
  @IsOptional()
  isPreview?: boolean;

  @IsString()
  @IsNotEmpty()
  sectionId!: string;
}
