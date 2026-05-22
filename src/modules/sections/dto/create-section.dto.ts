import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  order!: number;

  @IsString()
  @IsNotEmpty()
  courseId!: string;
}
