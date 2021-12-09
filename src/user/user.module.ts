import { forwardRef, Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { UtilModule } from 'src/util/util.module'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserGrant } from 'src/entities/user_grant'
import { TeamModule } from 'src/team/team.module'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserGrant]), UtilModule, forwardRef(() => TeamModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController]
})
export class UserModule {}
