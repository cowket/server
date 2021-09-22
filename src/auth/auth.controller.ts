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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { AuthService } from './auth.service'
import { JwtGuard } from './jwt.guard'

export type SimpleUserInfo = {
  email: string
  pw: string
}

@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  private logger: Logger = new Logger('AuthController')

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private utilService: UtilService
  ) {}

  // @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'login',
    description: '로그인 API'
  })
  async login(@Body() simpleUserInfo: SimpleUserInfo, @Res() res: Response) {
    const { email, pw } = simpleUserInfo

    if (!email || !pw) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Email or Password required'
      })
    }

    const user = await this.authService.validateUser(email, pw)

    if (user === null) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '존재하지 않는 유저입니다.'
      })
    } else if (user === false) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: '이메일 혹은 비밀번호를 확인해주세요.'
      })
    }

    const accessToken = await this.authService.genAccessToken(user)

    res.setHeader('Authorization', accessToken)
    return res.status(HttpStatus.OK).json(user)
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
      const createdUser = await this.usersService.createUser(email, cryptPw)
      await this.authService.updateUserRefreshToken(
        createdUser.generatedMaps[0].uuid
      )
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

  @UseGuards(JwtGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '액세스 토큰 검증',
    description: '현재 사용하고 있는 액세스 토큰 검증'
  })
  async verify(@Req() req: Request, @Res() res: Response) {
    const user = this.utilService.getUserInfoFromReq(req)

    return res.status(HttpStatus.OK).json(user)
  }
}
