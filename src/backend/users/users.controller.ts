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
import { Roles } from '@backend/auth/roles-auth.decorator';
import { RolesGuard } from '@backend/roles/guards/roles.guard';
import { AddRoleDto } from './dto/add-role.dto';
import { ValidationPipe } from '@backend/pipes/validation.pipe';
import { SessionGuard } from '@backend/session/guards/session.guard';
import { User } from './users.model';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }

    @ApiOperation({ summary: 'Check username availability' })
    @ApiResponse({ status: 200, type: Boolean })
    @Get('check-username/:username')
    public async checkUsername(@Param('username') username: string): Promise<boolean> {
        return this.userService.isUsernameAvailable(username);
    }

    @ApiOperation({ summary: 'Check email availability' })
    @ApiResponse({ status: 200, type: Boolean })
    @Get('check-email/:email')
    public async checkEmail(@Param('email') email: string): Promise<boolean> {
        return this.userService.isEmailAvailable(email);
    }

    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 200, type: User })
    @ApiBody({ type: CreateUserDto })
    @Roles('admin')
    @UseGuards(SessionGuard, RolesGuard)
    @UsePipes(ValidationPipe)
    @Post()
    public create(@Body() userDto: CreateUserDto): Promise<User> {
        return this.userService.createUser(userDto);
    }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [User] })
    @Roles('admin')
    @UseGuards(SessionGuard, RolesGuard)
    @Get()
    public getAll(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @ApiOperation({ summary: 'Assign role to user' })
    @ApiResponse({ status: 200, type: AddRoleDto })
    @ApiBody({ type: AddRoleDto })
    @Roles('admin')
    @UseGuards(SessionGuard, RolesGuard)
    @Post('/role')
    public addRole(@Body() dto: AddRoleDto): Promise<AddRoleDto> {
        return this.userService.addRole(dto);
    }

    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, type: Number })
    @Roles('admin')
    @UseGuards(SessionGuard, RolesGuard)
    @Delete('/:username')
    public delete(@Param('username') username: string): Promise<number> {
        return this.userService.deleteUser(username);
    }

    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, type: Number })
    @Roles('admin')
    @UseGuards(SessionGuard, RolesGuard)
    @Patch('/:username')
    public update(
        @Param('username') username: string,
        @Body() userDto: CreateUserDto,
    ): Promise<number> {
        return this.userService.updateUser(username, userDto);
    }
}
