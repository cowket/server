import { Module } from '@nestjs/common'
import { ChannelModule } from 'src/channel/channel.module'
import { MessageModule } from 'src/message/message.module'
import { SocketGateway } from './socket.gateway'
import { SocketService } from './socket.service'

@Module({
  imports: [MessageModule, ChannelModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketService]
})
export class SocketModule {}
