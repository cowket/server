import { Injectable } from '@nestjs/common'

@Injectable()
export class FileService {
  validateExtImage(mime: string, filename: string): boolean {
    const imageExts = /jpeg|jpg|png|gif/
    const checkExt = imageExts.test(filename.toLowerCase())
    const checkMime = imageExts.test(mime)

    return checkExt && checkMime
  }

  getImageUrl(file: Express.Multer.File) {
    // return createImageUrl
  }
}
