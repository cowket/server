import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { User } from 'src/entities/user'
import { v4 as uuid } from 'uuid'
import * as path from 'path'
import * as fs from 'fs'
import * as jdenticon from 'jdenticon'

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

  getUploadPath(): string {
    return process.env.NODE_ENV === 'production'
      ? '/app/dist/public'
      : path.resolve(process.cwd(), 'public')
  }

  getHttpFilePath(fileName: string): string {
    return process.env.NODE_ENV === 'production'
      ? 'https://cowket-api.stackunderflow.xyz/uploads' + fileName
      : 'http://localhost:4000/uploads' + fileName
  }

  genAvatar(uuid: string) {
    const defaultSize = 300
    const uploadPath = this.getUploadPath()
    const png = jdenticon.toPng(uuid, defaultSize, {
      backColor: '#fff'
    })
    const fileName = `/${uuid}.png`

    try {
      fs.writeFileSync(uploadPath + fileName, png)
      return this.getHttpFilePath(fileName)
    } catch (error) {
      throw new Error(error)
    }
  }
}
