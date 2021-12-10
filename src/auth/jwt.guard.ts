import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  // async handleRequest(err: any, user: DecodeTokenUser, info: Error) {
  //   if (info && info.name === 'TokenExpiredError') {
  //     const req = this.ctx.switchToHttp().getRequest()
  //     const res = this.ctx.switchToHttp().getResponse()
  //     const { authorization } = req.headers
  //     if (!authorization) {
  //       throw new UnauthorizedException()
  //     } else {
  //       const token = (authorization as string).split('Bearer ')[1]
  //       const { uuid } = this.jwtService.decode(token) as any
  //       const { refresh_token: refreshToken } = await this.userService.getRefreshTokenByUuid(uuid)
  //       await this.jwtService.verifyAsync(refreshToken, {
  //         clockTimestamp: Math.floor(Date.now() / 1000),
  //         ignoreExpiration: false,
  //         secret: this.configService.get('TO_SIGN')
  //       })
  //       const tokenUser = await this.authService.getTokenUserInfoByUuid(uuid)
  //       const accessToken = await this.authService.genAccessToken(tokenUser)
  //       const decodeTokenUser = this.jwtService.decode(accessToken) as DecodeTokenUser
  //       res.setHeader('Authorization', accessToken)
  //       return decodeTokenUser
  //     }
  //   }
  //   if (!user || err) {
  //     throw new UnauthorizedException()
  //   }
  //   return user
  // }
}
