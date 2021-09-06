import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { UtilModule } from 'src/util/util.module'
import { UsersService } from './users.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), UtilModule],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
