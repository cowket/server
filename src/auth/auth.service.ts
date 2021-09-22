import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/entities/user'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcryptjs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export type TokenUserInfo = Pick<User, 'avatar' | 'email' | 'id' | 'uuid'>

@Injectable()
export class AuthService {
  private logger: Logger = new Logger('AuthService')

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
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

  async genAccessToken(user: TokenUserInfo): Promise<string> {
    return this.jwtService.sign(user, {
      secret: this.configService.get('TO_SIGN'),
      expiresIn: '1h',
      mutatePayload: false,
      noTimestamp: false
    })
  }

  async verifyToken(accessToken: string) {
    return this.jwtService.verify(accessToken, {
      secret: this.configService.get('TO_SIGN')
    })
  }

  async updateUserRefreshToken(uuid: string) {
    const user = await this.usersRepository.findOne({ where: { uuid } })
    const tokenUser: TokenUserInfo = {
      avatar: user.avatar,
      email: user.email,
      id: user.id,
      uuid: user.uuid
    }
    const refreshToken = await this.jwtService.signAsync(tokenUser, {
      expiresIn: '7d',
      secret: this.configService.get('TO_SIGN')
    })

    this.logger.log(refreshToken)

    return this.usersRepository.update(
      { uuid },
      { refresh_token: refreshToken }
    )
  }

  async getTokenUserInfoByUuid(uuid: string): Promise<TokenUserInfo> {
    const user = await this.usersRepository.findOne({ where: { uuid } })

    return {
      avatar: user.avatar,
      email: user.email,
      id: user.id,
      uuid: user.uuid
    }
  }
}
