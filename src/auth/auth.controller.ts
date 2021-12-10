import {
  BadRequestException,
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { SimpleUserInfo } from 'src/entities/user'
import { TokenUserInfo } from 'src/types/user'
import { User } from 'src/user/user.decorator'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { JwtGuard } from './jwt.guard'

@ApiBearerAuth('access-token')
@ApiTags('Auth Controller')
@Controller('auth')
export class AuthController {
  constructor(private userService: UserService, private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'login',
    description: '로그인 API'
  })
  async login(@Body() simpleUserInfo: SimpleUserInfo, @Res() res: Response) {
    const { email, pw } = simpleUserInfo

    if (!email || !pw) {
      throw new BadRequestException(null, '이메일 혹은 비밀번호는 필수입니다.')
    }

    const user = await this.authService.validateUser(email, pw)

    if (user === null) {
      throw new BadRequestException(null, '존재하지 않는 유저입니다.')
    } else if (user === false) {
      throw new BadRequestException(null, '이메일 혹은 비밀번호를 확인해주세요.')
    }

    const accessToken = await this.authService.genAccessToken(user)
    return res.set({ Authorization: accessToken }).json(user)
  }

  @Post('new')
  @Header('Cache-Control', 'none')
  @HttpCode(201)
  @ApiOperation({
    summary: '회원가입',
    description: '이메일 / 비밀번호로 회원가입 후 랜덤 아바타 생성'
  })
  @ApiBody({ type: SimpleUserInfo })
  @ApiResponse({ type: User })
  async create(@Body() simpleUserInfo: SimpleUserInfo) {
    const { email, pw } = simpleUserInfo

    if (!email || !pw) {
      throw new BadRequestException(null, '이메일 혹은 비밀번호는 필수입니다.')
    }

    if (!this.userService.validateEmail(email)) {
      throw new BadRequestException(null, '지원되지 않는 이메일 형식입니다.')
    } else if (!this.userService.validatePw(pw)) {
      throw new BadRequestException(null, '지원되지 않는 비밀번호 형식입니다.')
    }

    const user = await this.userService.findOne(email)

    if (!user) {
      const cryptPw = await this.userService.cryptPassword(pw)
      const createdUser = await this.userService.createUser(email, cryptPw)
      await this.authService.updateUserRefreshToken(createdUser.uuid)
      return createdUser
    } else {
      throw new BadRequestException(null, '존재하는 이메일입니다.')
    }
  }

  @UseGuards(JwtGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '액세스 토큰 검증',
    description: '현재 사용하고 있는 액세스 토큰 검증'
  })
  async verify(@User() user: TokenUserInfo) {
    return user
  }
}
