import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'

export const multerOption = {
  storage: diskStorage({
    destination: (request, file, callback) => {
      if (!existsSync('public')) {
        mkdirSync('public')
      }

      callback(null, 'public')
    },
    filename: (req, file, callback) => {
      callback(null, Date.now().toString())
    }
  })
}
