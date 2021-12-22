import { Module } from '@nestjs/common'
import { UtilModule } from 'src/util/util.module'
import { FileController } from './file.controller'
import { FileService } from './file.service'

@Module({
  imports: [UtilModule],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}
