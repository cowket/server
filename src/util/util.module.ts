import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { UserModule } from 'src/user/user.module'
import { UtilService } from './util.service'

@Module({
  imports: [forwardRef(() => UserModule), TypeOrmModule.forFeature([User])],
  providers: [UtilService],
  exports: [UtilService]
})
export class UtilModule {}
