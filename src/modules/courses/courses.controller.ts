import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Patch,
	Delete,
	Request,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller({
	version: '1',
	path: 'courses',
})
export class CoursesController {
	constructor(private readonly coursesService: CoursesService) {}

	@Post()
	create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
		return this.coursesService.create(req.user.userId, createCourseDto);
	}

	@Get()
	findAll() {
		return this.coursesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.coursesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
		return this.coursesService.update(id, updateCourseDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.coursesService.remove(id);
	}
}
