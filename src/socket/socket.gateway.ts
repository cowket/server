import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway(4001, {
  transports: ['websocket'],
  cors: {
    methods: ['GET', 'POST', 'OPTIONS', 'PUT'],
    credentials: true,
    origin: '*'
  },
  path: '/'
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('SocketGateway')
  @WebSocketServer()
  server: Server

  @SubscribeMessage('events')
  handleEvent(@MessageBody('message') message: string, @ConnectedSocket() client: Socket): string {
    this.logger.log('handleEvent, events', message, client.rooms)
    return message
  }

  afterInit(server: Server) {
    this.logger.log('Init Gateway')
    this.server = server
  }

  handleConnection(socket: Socket) {
    this.logger.log(socket.id)
  }

  handleDisconnect(socket: Socket) {
    this.logger.log('disconnect', socket.id)
  }
}
