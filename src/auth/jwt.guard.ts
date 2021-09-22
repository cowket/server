import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  private logger = new Logger('AuthGuard')
  private ctx: ExecutionContext

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private authService: AuthService
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    this.ctx = context
    return super.canActivate(context)
  }

  // @ts-expect-error: handleRequest response type: TUser<any>
  async handleRequest(err, user, info: Error) {
    if (info && info.name === 'TokenExpiredError') {
      const req = this.ctx.switchToHttp().getRequest()
      const res = this.ctx.switchToHttp().getResponse()
      const { authorization } = req.headers

      if (!authorization) {
        throw new UnauthorizedException()
      } else {
        const token = (authorization as string).split('Bearer ')[1]
        const { uuid } = this.jwtService.decode(token) as any
        const { refresh_token: refreshToken } =
          await this.usersService.getRefreshTokenByUuid(uuid)
        await this.jwtService.verifyAsync(refreshToken, {
          clockTimestamp: Math.floor(Date.now() / 1000),
          ignoreExpiration: false,
          secret: this.configService.get('TO_SIGN')
        })
        const tokenUser = await this.authService.getTokenUserInfoByUuid(uuid)
        const accessToken = await this.authService.genAccessToken(tokenUser)
        const decodeTokenUser = this.jwtService.decode(accessToken)

        res.setHeader('Authorization', accessToken)

        return decodeTokenUser
      }
    }

    if (!user || err) {
      throw new UnauthorizedException()
    }

    return user
  }
}
