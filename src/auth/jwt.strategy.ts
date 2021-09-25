import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { TokenUserInfo } from 'src/types/user'

type ITokenUserInfo = {
  iat: number
  exp: number
} & TokenUserInfo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy')

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('TO_SIGN'),
      passReqToCallback: false
    })
  }

  async validate(payload: ITokenUserInfo) {
    return payload
  }
}
