import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilModule } from 'src/util/util.module'
import { MessageService } from './message.service'
import { Message } from 'src/entities/message'
import { TeamModule } from 'src/team/team.module'
import { MessageController } from './message.controller'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { DirectMessage } from 'src/entities/direct_message'

@Module({
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([Message, TeamUserProfile, DirectMessage]),
    TeamModule
  ],
  providers: [MessageService],
  exports: [MessageService],
  controllers: [MessageController]
})
export class MessageModule {}
