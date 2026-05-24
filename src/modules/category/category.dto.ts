import { IsString, MinLength } from 'class-validator';

export class CategoryDto {
  @IsString()
  @MinLength(5)
  name!: string;
}
