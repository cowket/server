import { Global, Module } from '@nestjs/common'
import { ChannelModule } from 'src/channel/channel.module'
import { GrantModule } from 'src/grant/grant.module'
import { MessageModule } from 'src/message/message.module'
import { ReactModule } from 'src/react/react.module'
import { TeamModule } from 'src/team/team.module'
import { UserModule } from 'src/user/user.module'
import { SocketGateway } from './socket.gateway'
import { SocketService } from './socket.service'

@Global()
@Module({
  imports: [MessageModule, ChannelModule, TeamModule, UserModule, ReactModule, GrantModule],
  providers: [SocketGateway, SocketService],
  exports: [SocketService]
})
export class SocketModule {}
