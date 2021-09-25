import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { UsersModule } from 'src/users/users.module'
import { UtilService } from './util.service'

@Module({
  imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([User])],
  providers: [UtilService],
  exports: [UtilService]
})
export class UtilModule {}
