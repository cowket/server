import { Module } from '@nestjs/common'
import { ChannelModule } from 'src/channel/channel.module'
import { MessageModule } from 'src/message/message.module'
import { SocketGateway } from './socket.gateway'

@Module({
  imports: [MessageModule, ChannelModule],
  providers: [SocketGateway]
})
export class SocketModule {}
