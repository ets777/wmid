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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';
import { Role } from './roles.model';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @ApiOperation({ summary: 'Создание роли' })
  @ApiResponse({ status: 200, type: Role })
  @ApiBody({ type: CreateRoleDto })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateRoleDto): Promise<Role> {
    return this.roleService.createRole(dto);
  }

  @ApiOperation({ summary: 'Удаление роли' })
  @ApiResponse({ status: 200, type: Number })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('/:code')
  delete(@Param('code') code: string): Promise<number> {
    return this.roleService.deleteRole(code);
  }

  @ApiOperation({ summary: 'Выбор роли по коду' })
  @ApiResponse({ status: 200, type: Role })
  @Get('/:code')
  getByCode(@Param('code') code: string): Promise<Role> {
    return this.roleService.getRoleByCode(code);
  }

  @ApiOperation({ summary: 'Получение всех ролей' })
  @ApiResponse({ status: 200, type: [Role] })
  @Get()
  getAll(): Promise<Role[]> {
    return this.roleService.getAllRoles();
  }

  @ApiOperation({ summary: 'Обновление роли' })
  @ApiResponse({ status: 200, type: Number })
  @ApiBody({ type: CreateRoleDto })
  @Roles('admin')
  @UseGuards(RolesGuard)
  @Patch('/:code')
  update(
    @Param('code') code: string,
    @Body() roleDto: CreateRoleDto,
  ): Promise<number> {
    return this.roleService.updateRole(code, roleDto);
  }
}
