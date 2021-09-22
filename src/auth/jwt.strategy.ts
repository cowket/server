import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PassportStrategy } from '@nestjs/passport'
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
      passReqToCallback: false
    })
  }

  async validate(payload: ITokenUserInfo) {
    return payload
  }
}
