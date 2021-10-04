import { Logger } from '@nestjs/common'
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { SocketPushMessageDto } from 'src/entities/message'
import { MessageService } from 'src/message/message.service'

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

  constructor(private messageService: MessageService) {}

  afterInit(server: Server) {
    this.server = server
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: SocketPushMessageDto) {
    try {
      const message = await this.messageService.pushMessage(data)
      this.server.to(data.channelUuid).emit('newMessage', message)
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
