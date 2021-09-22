import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  private logger = new Logger('AuthGuard')
  private ctx: ExecutionContext

  canActivate(context: ExecutionContext) {
    this.ctx = context
    return super.canActivate(context)
  }

  handleRequest(err, user, info: Error) {
    if (info.name === 'TokenExpiredError') {
      // const res = this.ctx.switchToHttp().getResponse()
      // this.logger.log(res.setHeader('Authorization', '123123'))
      // return {}
      throw new UnauthorizedException()
    }

    if (!user || err) {
      throw new UnauthorizedException()
    }

    return user
  }
}
