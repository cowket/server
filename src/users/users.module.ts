import { forwardRef, Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { UtilModule } from 'src/util/util.module'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { UserGrant } from 'src/entities/user_grant'
import { TeamModule } from 'src/team/team.module'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserGrant]),
    UtilModule,
    forwardRef(() => TeamModule)
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
