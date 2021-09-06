import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'

export type SimpleUserInfo = {
  email: string
  pw: string
}

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger('AuthController')

  constructor(private usersService: UsersService, private authService: AuthService) {}

  // @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'login (test)',
    description: '로그인 API - 테스트중'
  })
  async login(@Req() req) {
    return req.user
  }

  @Post('new')
  @Header('Cache-Control', 'none')
  @HttpCode(201)
  @ApiOperation({
    summary: '회원가입',
    description: '이메일 / 비밀번호로 회원가입 후 랜덤 아바타 생성'
  })
  async create(@Body() simpleUserInfo: SimpleUserInfo, @Res() res: Response) {
    const { email, pw } = simpleUserInfo

    if (!email || !pw) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Email or Password required'
      })
    }

    if (!this.usersService.validateEmail(email)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unsupported email format'
      })
    } else if (!this.usersService.validatePw(pw)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Unsupported password format'
      })
    }

    const user = await this.usersService.findOne(email)

    if (!user) {
      const cryptPw = await this.usersService.cryptPassword(pw)
      const refreshToken = await this.authService.genInitRefreshToken({ email, pw })
      const createdUser = await this.usersService.createUser(email, cryptPw, refreshToken)
      return res.status(HttpStatus.CREATED).json({
        success: true,
        user: {
          id: createdUser.identifiers[0].id,
          uuid: createdUser.identifiers[0].uuid
        }
      })
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Exist email'
      })
    }
  }
}
