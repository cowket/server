import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilModule } from 'src/util/util.module'
import { MessageService } from './message.service'
import { Message } from 'src/entities/message'
import { MessageController } from './message.controller'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { Reaction } from 'src/entities/reaction'
import { ReactModule } from 'src/react/react.module'

@Global()
@Module({
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([Message, TeamUserProfile, Reaction]),
    ReactModule
  ],
  providers: [MessageService],
  exports: [MessageService],
  controllers: [MessageController]
})
export class MessageModule {}
