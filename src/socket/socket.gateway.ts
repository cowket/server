import { Logger } from '@nestjs/common'
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
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
  handleMessage(client: Socket, data): void {
    this.logger.log(client.rooms, data)
    this.messageService.sendMessage(data)
  }
}
