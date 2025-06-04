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
import { RolesGuard } from '@backend/roles/guards/roles.guard';
import { Roles } from '@backend/auth/roles-auth.decorator';
import { Role } from './roles.model';

@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) { }

    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post()
    create(@Body() dto: CreateRoleDto): Promise<Role> {
        return this.roleService.createRole(dto);
    }

    @Roles('admin')
    @UseGuards(RolesGuard)
    @Delete('/:code')
    delete(@Param('code') code: string): Promise<number> {
        return this.roleService.deleteRole(code);
    }

    @Get('/:code')
    getByCode(@Param('code') code: string): Promise<Role> {
        return this.roleService.getRoleByCode(code);
    }

    @Get()
    getAll(): Promise<Role[]> {
        return this.roleService.getAllRoles();
    }

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
