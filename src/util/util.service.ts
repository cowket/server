import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { User } from 'src/entities/user'
import { v4 as uuid } from 'uuid'

type TokenUserInfo = Pick<User, 'avatar' | 'email' | 'id' | 'uuid'>

type FullTokenUserInfo = TokenUserInfo & {
  iat: number
  exp: number
}

@Injectable()
export class UtilService {
  genUuid(): string {
    return uuid()
  }

  getUserInfoFromReq(req: Request): TokenUserInfo {
    if (req.user) {
      const user = req.user as FullTokenUserInfo
      delete user.iat
      delete user.exp
      return user
    } else {
      return null
    }
  }
}
