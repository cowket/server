import { Injectable, Logger, Req, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from 'src/users/users.service'
import { AuthService, TokenUserInfo } from './auth.service'

type ITokenUserInfo = {
  iat: number
  exp: number
} & TokenUserInfo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy')

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('TO_SIGN'),
      passReqToCallback: true
    })
  }

  async validate(@Req() req: Request, payload: ITokenUserInfo) {
    const token = req.headers.authorization.split('Bearer ')[1]
    const { uuid } = payload

    try {
      const verify = await this.jwtService.verifyAsync(token, {
        publicKey: this.configService.get('TO_SIGN'),
        clockTimestamp: Math.floor(Date.now() / 1000)
      })
      return verify
    } catch (verifyError) {
      this.logger.log(verifyError)
      const { refresh_token } = await this.usersService.getRefreshTokenByUuid(
        uuid
      )

      try {
        await this.jwtService.verifyAsync(refresh_token, {
          clockTimestamp: Math.floor(Date.now() / 1000)
        })

        const tu = await this.authService.getTokenUserInfoByUuid(uuid)
        const accessToken = await this.authService.genAccessToken(tu)
        const v = await this.jwtService.verifyAsync(accessToken, {
          clockTimestamp: Math.floor(Date.now() / 1000)
        })

        return v
      } catch (error) {
        console.log(error)
        throw new UnauthorizedException()
      }
    }
  }
}
