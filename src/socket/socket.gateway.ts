import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChannelService } from 'src/channel/channel.service'
import { SocketPushMessageDto } from 'src/entities/message'
import { MessageService } from 'src/message/message.service'
import { WsExceptionFilter } from './socket.filter'

@UseFilters(WsExceptionFilter)
@WebSocketGateway(4001, {
  transports: ['websocket'],
  cors: {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    credentials: true,
    origin: '*'
  },
  path: '/',
  namespace: 'cowket'
})
export class SocketGateway implements OnGatewayInit {
  private logger = new Logger('SocketGateway')

  @WebSocketServer()
  server: Server

  constructor(
    private messageService: MessageService,
    private channelService: ChannelService
  ) {}

  async afterInit(server: Server) {
    this.server = server

    const channelData = await this.channelService.getAllChannel()
    this.logger.log(channelData.map((channel) => channel.uuid))
  }

  @SubscribeMessage('pushMessage')
  @UsePipes(new ValidationPipe())
  async handleMessage(
    client: Socket,
    @MessageBody() data: SocketPushMessageDto
  ) {
    try {
      const message = await this.messageService.pushMessage(data)
      this.server.to(data.channelUuid).emit('newMessage', message) // 채널에 메세지 전파
    } catch (error) {
      this.logger.error(error)
      client.emit('errorPacket', { error })
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: any) {
    client.join(data.channelUuid)
  }
}
