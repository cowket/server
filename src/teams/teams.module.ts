import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
import { UsersModule } from 'src/users/users.module'
import { UtilModule } from 'src/util/util.module'
import { TeamsController } from './teams.controller'
import { TeamsService } from './teams.service'

@Module({
  imports: [TypeOrmModule.forFeature([Team]), UsersModule, UtilModule],
  controllers: [TeamsController],
  providers: [TeamsService]
})
export class TeamsModule {}
