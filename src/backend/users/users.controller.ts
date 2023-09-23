import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  UsePipes,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { IUser } from './users.interface';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { ValidationPipe } from '../pipes/validation.pipe';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';

@Roles('admin')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UsePipes(ValidationPipe)
  @Post()
  create(@Body() userDto: CreateUserDto): Promise<IUser> {
    return this.userService.createUser(userDto);
  }

  @Get()
  getAll(): Promise<IUser[]> {
    return this.userService.getAllUsers();
  }

  @Post('/role')
  addRole(@Body() dto: AddRoleDto): Promise<number> {
    return this.userService.addRole(dto);
  }

  @Delete('/:username')
  delete(@Param('username') username: string): Promise<number> {
    return this.userService.deleteUser(username);
  }

  @Patch('/:username')
  update(
    @Param('username') username: string,
    @Body() userDto: CreateUserDto,
  ): Promise<number> {
    return this.userService.updateUser(username, userDto);
  }
}
