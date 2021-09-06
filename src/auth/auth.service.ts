import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import { SimpleUserInfo } from './auth.controller'
// import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, pw: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(email)

      if (!user) return null

      // TODO 전달된 비밀번호 <-> DB에 암호화된 비밀번호 비교 필요
      // 테스트
      return user
    } catch (error) {} // 에러 핸들 필요
  }

  async genInitRefreshToken(user: SimpleUserInfo): Promise<string> {
    return this.jwtService.sign(user, { privateKey: this.configService.get('TO_SIGN') })
  }
}
