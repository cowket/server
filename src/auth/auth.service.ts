import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/entities/user'
import { UsersService } from 'src/users/users.service'
import { SimpleUserInfo } from './auth.controller'
import * as bcrypt from 'bcryptjs'

export type TokenUserInfo = Pick<User, 'avatar' | 'email' | 'id' | 'uuid'>

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(
    email: string,
    pw: string
  ): Promise<TokenUserInfo | null | false> {
    try {
      const user = await this.usersService.findOne(email)

      if (!user) return null

      const isSame = await bcrypt.compare(pw, user.password)

      return isSame
        ? {
            avatar: user.avatar,
            email: user.email,
            id: user.id,
            uuid: user.uuid
          }
        : false
    } catch (error) {
      return null
    }
  }

  async genInitRefreshToken(user: SimpleUserInfo): Promise<string> {
    return this.jwtService.sign(user, {
      secret: this.configService.get('TO_SIGN')
    })
  }

  async genAccessToken(user: TokenUserInfo): Promise<string> {
    return this.jwtService.sign(user, {
      secret: this.configService.get('TO_SIGN'),
      expiresIn: '1h'
    })
  }

  async verifyToken(accessToken: string) {
    return this.jwtService.verify(accessToken, {
      secret: this.configService.get('TO_SIGN')
    })
  }
}
