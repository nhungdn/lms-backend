import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryDto } from './category.dto';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Role } from 'src/generated/prisma/client';

@Controller({
  version: '1',
  path: 'categories',
})
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() categoryDto: CategoryDto, @CurrentUser() user) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create a category',
      );
    }

    return this.categoryService.createCategory(categoryDto);
  }
}
