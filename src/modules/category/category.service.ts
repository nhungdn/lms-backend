import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './category.dto';
import { generateSlug } from 'src/common/utils/generate-slug';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(category: CategoryDto) {
    const slug = generateSlug(category.name);

    return this.prisma.category.create({
      data: {
        name: category.name,
        slug,
      },
    });
  }
}
