import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/entities/user'
import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcryptjs'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DecodeTokenUser, TokenUserInfo } from 'src/types/user'

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pw: string): Promise<TokenUserInfo | null | false> {
    try {
      const user = await this.userService.findOne(email)

      if (!user) return null

      const isSame = await bcrypt.compare(pw, user.password)

      return isSame
        ? {
            avatar: user.avatar,
            email: user.email,
            uuid: user.uuid
          }
        : false
    } catch (error) {
      return null
    }
  }

  async validateUserByPayload(payload: DecodeTokenUser, token: string) {
    try {
      const user = (await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('TO_SIGN')
      })) as DecodeTokenUser
      return user
    } catch (error) {
      try {
        const { refresh_token } = await this.userService.getRefreshTokenByUuid(payload.uuid)
        const verifyUser = await this.jwtService.verifyAsync(refresh_token, {
          secret: this.configService.get('TO_SIGN')
        })
        await this.updateUserRefreshToken(payload.uuid)
        return verifyUser
      } catch (errorWithExpiredRefreshToken) {
        return false
      }
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
      uuid: user.uuid
    }
    const refreshToken = await this.jwtService.signAsync(tokenUser, {
      expiresIn: '7d',
      secret: this.configService.get('TO_SIGN')
    })

    return this.usersRepository.update({ uuid }, { refresh_token: refreshToken })
  }

  async getTokenUserInfoByUuid(uuid: string): Promise<TokenUserInfo> {
    const user = await this.usersRepository.findOne({ where: { uuid } })

    return {
      avatar: user.avatar,
      email: user.email,
      uuid: user.uuid
    }
  }
}
