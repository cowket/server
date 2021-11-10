import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilModule } from 'src/util/util.module'
import { MessageService } from './message.service'
import { Message } from 'src/entities/message'
import { MessageController } from './message.controller'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { DirectMessage } from 'src/entities/direct_message'
import { Reaction } from 'src/entities/reaction'

@Global()
@Module({
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([
      Message,
      TeamUserProfile,
      DirectMessage,
      Reaction
    ])
  ],
  providers: [MessageService],
  exports: [MessageService],
  controllers: [MessageController]
})
export class MessageModule {}
