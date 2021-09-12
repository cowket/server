import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  // private logger = new Logger('JwtGuard')
  // handleRequest(err, user, info) {
  //   this.logger.log(err, user, info)
  //   return user
  // }
  // canActivate(context: ExecutionContext) {
  //   return super.canActivate(context)
  // }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
