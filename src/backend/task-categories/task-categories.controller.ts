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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskCategoriesService } from './task-categories.service';
import { TaskCategory } from './task-categories.model';
import { Roles } from '../auth/roles-auth.decorator';
import { CreateTaskCategoryDto } from './dto/create-task-category.dto';
import { RolesGuard } from 'auth/guards/roles.guard';
import { AccessTokenGuard } from 'auth/guards/accessToken.guard';
import { UpdateTaskCategoryDto } from './dto/update-task-category.dto';

@ApiTags('Категории заданий')
@Controller('task-categories')
@UseGuards(AccessTokenGuard)
export class TaskCategoriesController {
  constructor(private taskCategoriesService: TaskCategoriesService) {}

  @ApiOperation({ summary: 'Создание категории задания' })
  @ApiResponse({ status: 200, type: TaskCategory })
  @ApiBody({ type: CreateTaskCategoryDto })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateTaskCategoryDto): Promise<TaskCategory> {
    return this.taskCategoriesService.createTaskCategory(dto);
  }

  @ApiOperation({ summary: 'Удаление категории задания' })
  @ApiResponse({ status: 200, type: Number })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('/:code')
  delete(@Param('code') code: string): Promise<number> {
    return this.taskCategoriesService.deleteTaskCategory(code);
  }

  @ApiOperation({ summary: 'Выбор категории задания по ID' })
  @ApiResponse({ status: 200, type: TaskCategory })
  @Get('/:code')
  getByCode(@Param('code') code: string): Promise<TaskCategory> {
    return this.taskCategoriesService.getTaskCategoryByCode(code);
  }

  @ApiOperation({ summary: 'Получение всех категорий заданий' })
  @ApiResponse({ status: 200, type: [TaskCategory] })
  @Get()
  getAll(): Promise<TaskCategory[]> {
    return this.taskCategoriesService.getAllTaskCategories();
  }

  @ApiOperation({ summary: 'Обновление категории заданий' })
  @ApiResponse({ status: 200, type: Number })
  @Patch('/:code')
  update(
    @Param('code') code: string,
    @Body() taskCategoryDto: UpdateTaskCategoryDto,
  ): Promise<number> {
    return this.taskCategoriesService.updateTaskCategory(code, taskCategoryDto);
  }
}
