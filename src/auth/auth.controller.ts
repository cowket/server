import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { UsersService } from 'src/users/users.service'

export type SimpleUserInfo = {
  email: string
  pw: string
}

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger('AuthController')

  constructor(private usersService: UsersService) {}

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

    const user = await this.usersService.findOne(email)

    if (!user) {
      const cryptPw = await this.usersService.cryptPassword(pw)
      const createdUser = await this.usersService.createUser(email, cryptPw)
      return res.status(HttpStatus.CREATED).json(createdUser)
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Exist email'
      })
    }
  }
}
