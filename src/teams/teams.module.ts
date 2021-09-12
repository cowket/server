import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
import { UtilModule } from 'src/util/util.module'
import { TeamsController } from './teams.controller'
import { TeamsService } from './teams.service'

@Module({
  imports: [TypeOrmModule.forFeature([Team]), UtilModule],
  controllers: [TeamsController],
  providers: [TeamsService]
})
export class TeamsModule {}
