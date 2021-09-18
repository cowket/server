import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'

export const multerOption = {
  storage: diskStorage({
    destination: (request, file, callback) => {
      if (!existsSync('/app/public')) {
        mkdirSync('/app/public')
      }

      callback(null, '/app/public')
    },
    filename: (req, file, callback) => {
      callback(null, Date.now().toString())
    }
  })
}
