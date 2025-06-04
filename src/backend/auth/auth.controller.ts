import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '@backend/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { SessionGuard } from '@backend/session/guards/session.guard';
import { UserCredentialsDto } from '@backend/users/dto/user-credentials.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserBasicAttrDto } from '@backend/users/dto/user-basic-attr.dto';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Sign in' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiBody({ type: UserBasicAttrDto })
    @Post('/sign-in')
    public async signIn(
        @Body() userDto: UserCredentialsDto,
    ): Promise<AuthResponseDto> {
        const response = await this.authService.signIn(userDto);
        return response;
    }

    @ApiOperation({ summary: 'Sign out' })
    @ApiResponse({ status: 200, type: Boolean })
    @UseGuards(SessionGuard)
    @Get('/sign-out')
    public async signOut(
        @Req() req: Request,
    ): Promise<boolean> {
        const sessionId = req.headers['x-session-id'] as string;
        const result = await this.authService.signOut(sessionId);
        
        return result;
    }

    @ApiOperation({ summary: 'Sign up' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiBody({ type: CreateUserDto })
    @Post('/sign-up')
    public async signUp(
        @Body() userDto: CreateUserDto,
    ): Promise<AuthResponseDto> {
        const response = await this.authService.signUp(userDto);
        return response;
    }

    @ApiOperation({ summary: 'Check auth' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @Get('/check')
    public async checkAuth(@Req() req: Request): Promise<AuthResponseDto> {
        const sessionId = req.headers['x-session-id'] as string;
        
        if (!sessionId) {
            return null;
        }
        return await this.authService.checkAuth(sessionId);
    }
}
