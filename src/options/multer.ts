import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'

const filePath =
  process.env.NODE_ENV === 'production' ? '/app/dist/public' : 'public'

export const multerOption = {
  storage: diskStorage({
    destination: (request, file, callback) => {
      if (!existsSync(filePath)) {
        mkdirSync(filePath)
      }

      callback(null, filePath)
    },
    filename: (req, file, callback) => {
      const r = Math.floor(Math.random() * 10 + 1)
      let ext: string

      if (file.originalname.indexOf('.') === -1) {
        ext = ''
      } else {
        const split = file.originalname.split('.')
        const __ext = split[split.length - 1]
        ext = '.' + __ext
      }

      callback(null, `${Date.now().toString()}-${r}` + ext)
    }
  })
}
