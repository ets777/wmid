import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TaskCategoriesService } from './task-categories.service';
import { ITaskCategory } from './task-categories.interface';
import { Roles } from '@backend/auth/roles-auth.decorator';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { AccessTokenGuard } from '@backend/auth/guards/accessToken.guard';
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto';

@Controller('task-categories')
@UseGuards(AccessTokenGuard)
export class TaskCategoriesController {
  constructor(private taskCategoriesService: TaskCategoriesService) {}

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateTaskCategoryDto): Promise<number> {
    return this.taskCategoriesService.createTaskCategory(dto);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('/:code')
  delete(@Param('code') code: string): Promise<number> {
    return this.taskCategoriesService.deleteTaskCategory(code);
  }

  @Get('/:code')
  getByCode(@Param('code') code: string): Promise<ITaskCategory> {
    return this.taskCategoriesService.getTaskCategoryByCode(code);
  }

  @Get()
  getAll(): Promise<ITaskCategory[]> {
    return this.taskCategoriesService.getAllTaskCategories();
  }

  @Patch('/:code')
  update(
    @Param('code') code: string,
    @Body() taskCategoryDto: UpdateTaskCategoryDto,
  ): Promise<number> {
    return this.taskCategoriesService.updateTaskCategory(code, taskCategoryDto);
  }
}
