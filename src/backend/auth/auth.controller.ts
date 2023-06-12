import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { UserBasicAttrDto } from '../users/dto/user-basic-attr.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Вход' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBody({ type: UserBasicAttrDto })
  @Post('/sign-in')
  signIn(@Body() userDto: UserBasicAttrDto): Promise<AuthResponseDto> {
    return this.authService.signIn(userDto);
  }

  @ApiOperation({ summary: 'Выход' })
  @ApiResponse({ status: 200, type: Boolean })
  @UseGuards(AccessTokenGuard)
  @Get('/sign-out')
  signOut(@Req() req: any): Promise<boolean> {
    return this.authService.signOut(req.user.username);
  }

  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiBody({ type: CreateUserDto })
  @Post('/sign-up')
  signUp(@Body() userDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.signUp(userDto);
  }

  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  refreshTokens(@Req() req: any): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(
      req.user.username,
      req.user.refreshToken,
    );
  }
}
