import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  UsePipes,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './users.model';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { ValidationPipe } from '../pipes/validation.pipe';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@ApiTags('Пользователи')
@Roles('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @ApiOperation({ summary: 'Создание пользователя' })
  @ApiResponse({ status: 200, type: User })
  @ApiBody({ type: CreateUserDto })
  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(userDto);
  }

  @ApiOperation({ summary: 'Получение всех пользователей' })
  @ApiResponse({ status: 200, type: [User] })
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Выдача ролей' })
  @ApiResponse({ status: 200, type: AddRoleDto })
  @ApiBody({ type: AddRoleDto })
  @Post('/role')
  addRole(@Body() dto: AddRoleDto): Promise<AddRoleDto> {
    return this.userService.addRole(dto);
  }

  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiResponse({ status: 200, type: Number })
  @Delete('/:username')
  delete(@Param() username: string): Promise<number> {
    return this.userService.deleteUser(username);
  }
}
