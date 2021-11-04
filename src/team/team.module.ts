import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChannelModule } from 'src/channel/channel.module'
import { Team } from 'src/entities/team'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { User } from 'src/entities/user'
import { UserGrant } from 'src/entities/user_grant'
import { GrantModule } from 'src/grant/grant.module'
import { MessageModule } from 'src/message/message.module'
import { UsersModule } from 'src/users/users.module'
import { UtilModule } from 'src/util/util.module'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamUserProfile, UserGrant, User]),
    UtilModule,
    forwardRef(() => UsersModule),
    ConfigModule,
    forwardRef(() => ChannelModule),
    MessageModule,
    GrantModule
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService]
})
export class TeamModule {}
