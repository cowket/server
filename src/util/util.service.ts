import { Injectable } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import * as path from 'path'
import * as fs from 'fs'
import * as jdenticon from 'jdenticon'

@Injectable()
export class UtilService {
  genUuid(): string {
    return uuid()
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
