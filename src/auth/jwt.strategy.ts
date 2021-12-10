import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { DecodeTokenUser } from 'src/types/user'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('TO_SIGN'),
      passReqToCallback: true
    })
  }

  async validate(req: Request, payload: DecodeTokenUser) {
    if (!req.headers.authorization) return false
    const token = req.headers.authorization.split('Bearer ')[1]
    return this.authService.validateUserByPayload(payload, token)
  }
}
