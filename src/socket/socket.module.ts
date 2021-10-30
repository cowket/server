import { Global, Module } from '@nestjs/common'
import { ChannelModule } from 'src/channel/channel.module'
import { MessageModule } from 'src/message/message.module'
import { TeamModule } from 'src/team/team.module'
import { SocketGateway } from './socket.gateway'
import { SocketService } from './socket.service'

@Global()
@Module({
  imports: [MessageModule, ChannelModule, TeamModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketService]
})
export class SocketModule {}
