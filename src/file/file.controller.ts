import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { multerOption } from 'src/options/multer'
import { FileService } from './file.service'

class FileRequest {
  @ApiProperty()
  file: Express.Multer.File
}

@ApiTags('File Controller')
@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file', multerOption))
  @ApiOperation({ summary: '파일 업로드' })
  @ApiBody({
    type: FileRequest
  })
  @ApiResponse({ status: 200, description: '파일 업로드 성공' })
  @ApiResponse({ status: 400, description: '파일 업로드 실패, 용량 제한 및 확장자 확인' })
  uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) throw new HttpException('파일 읽기 실패', HttpStatus.BAD_REQUEST)
    if (!this.fileService.validateExtImage(file.mimetype, file.originalname))
      throw new HttpException('이미지 확장자만 가능', HttpStatus.BAD_REQUEST)
    return res.status(HttpStatus.OK).send({
      uploads: file.filename
    })
  }
}
