import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '@backend/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { UserCredentialsDto } from '@backend/users/dto/user-credentials.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-in')
  signIn(@Body() userDto: UserCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.signIn(userDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/sign-out')
  signOut(@Req() req: any): Promise<boolean> {
    return this.authService.signOut(req.user.username);
  }

  @Post('/sign-up')
  signUp(@Body() userDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.authService.signUp(userDto);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/refresh')
  refreshTokens(@Req() req: any): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(
      req.user.username,
      req.user.refreshToken,
    );
  }

  @UseGuards(AccessTokenGuard)
  @Get('/check')
  checkAuth(): boolean {
    return true;
  }
}
