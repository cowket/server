import { Controller, Logger, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger('AuthController')

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'login (test)', description: '로그인 API - 테스트중' })
  async login(@Request() req) {
    return req.user
  }
}
