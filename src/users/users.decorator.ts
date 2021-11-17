import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TokenUserInfo } from 'src/types/user'

export const Users = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  return req.user.uuid
})

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  const user = req.user as TokenUserInfo & { iat: number; exp: number }
  delete user.iat
  delete user.exp
  return user
})
