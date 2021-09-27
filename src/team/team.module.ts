import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { UserGrant } from 'src/entities/user_grant'
import { UsersModule } from 'src/users/users.module'
import { UtilModule } from 'src/util/util.module'
import { TeamController } from './team.controller'
import { TeamService } from './team.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, TeamUserProfile, UserGrant]),
    UsersModule,
    UtilModule
  ],
  controllers: [TeamController],
  providers: [TeamService]
})
export class TeamsModule {}
