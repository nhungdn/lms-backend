import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({
  version: '1',
  path: 'users',
})
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() data: { name: string; email: string }) {
    return this.usersService.create(data);
  }
}
