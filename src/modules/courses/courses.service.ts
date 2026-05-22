import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
	constructor(private prisma: PrismaService) {}

	private slugify(title: string) {
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	async create(instructorId: string, data: CreateCourseDto) {
		const slug = this.slugify(data.title);

		return this.prisma.course.create({
			data: {
				title: data.title,
				slug,
				description: data.description,
				thumbnailUrl: data.thumbnail,
				price: data.price,
				instructor: { connect: { id: instructorId } },
				category: { connect: { id: data.categoryId } },
			},
		});
	}

	async findAll() {
		return this.prisma.course.findMany();
	}

	async findOne(id: string) {
		const course = await this.prisma.course.findUnique({ where: { id } });
		if (!course) throw new NotFoundException('Course not found');
		return course;
	}

	async update(id: string, dto: UpdateCourseDto) {
		const data: any = {};
		if (dto.title) {
			data.title = dto.title;
			data.slug = this.slugify(dto.title);
		}
		if (dto.description !== undefined) data.description = dto.description;
		if (dto.thumbnail !== undefined) data.thumbnailUrl = dto.thumbnail;
		if (dto.price !== undefined) data.price = dto.price;
		if (dto.status !== undefined) data.status = dto.status;
		if ((dto as any).categoryId) data.category = { connect: { id: (dto as any).categoryId } };

		return this.prisma.course.update({ where: { id }, data });
	}

	async remove(id: string) {
		return this.prisma.course.delete({ where: { id } });
	}
}
