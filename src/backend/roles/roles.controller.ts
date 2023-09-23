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
import { IRole } from './roles.interface';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() dto: CreateRoleDto): Promise<IRole> {
    return this.roleService.createRole(dto);
  }

  @Roles('admin')
  @UseGuards(RolesGuard)
  @Delete('/:code')
  delete(@Param('code') code: string): Promise<number> {
    return this.roleService.deleteRole(code);
  }

  @Get('/:code')
  getByCode(@Param('code') code: string): Promise<IRole> {
    return this.roleService.getRoleByCode(code);
  }

  @Get()
  getAll(): Promise<IRole[]> {
    return this.roleService.getAllRoles();
  }

  @Patch('/:code')
  update(
    @Param('code') code: string,
    @Body() roleDto: CreateRoleDto,
  ): Promise<number> {
    return this.roleService.updateRole(code, roleDto);
  }
}
