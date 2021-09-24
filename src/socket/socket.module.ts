import { Module } from '@nestjs/common'
import { MessageModule } from 'src/message/message.module'
import { SocketGateway } from './socket.gateway'

@Module({
  imports: [MessageModule],
  providers: [SocketGateway]
})
export class SocketModule {}
