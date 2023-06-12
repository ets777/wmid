import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'string', description: 'Refresh-токен' })
  refreshToken: string;

  @ApiProperty({ example: 'string', description: 'Access-токен' })
  accessToken: string;
}
