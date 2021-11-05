import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
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
import { RequestDirectMessageDto } from 'src/entities/direct_message'
import { LoadMessageDto, SocketPushMessageDto } from 'src/entities/message'
import { MessageService } from 'src/message/message.service'
import { UsersService } from 'src/users/users.service'
import { WsExceptionFilter } from './socket.filter'
import { SocketService } from './socket.service'
import { getSocketEvent } from './socket.type'

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
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger('SocketGateway')

  @WebSocketServer()
  server: Server

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private userService: UsersService
  ) {}

  afterInit(server: Server) {
    this.server = server
    this.socketService.setSocketServer(server)
  }

  handleConnection(client: Socket) {
    client.on(
      'cowket:connection-with-auth-required',
      async (innerClient: Socket, userUuid: string) => {
        await this.socketService.registerSocket(innerClient.id, userUuid)
      }
    )
  }

  async handleDisconnect(client: Socket) {
    await this.socketService.removeSocket(client.id)
  }

  @SubscribeMessage('pushDirectMessage')
  @UsePipes(new ValidationPipe())
  async handleDirectMessage(
    @MessageBody() data: RequestDirectMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const pushedMessage = await this.messageService.pushDirectMessage(data)
    const receiverSocketId = await this.userService.getSocketIdByUserUuid(
      data.receiver_uuid
    )

    client.emit(getSocketEvent('PUSH_DIRECT_MESSAGE'), pushedMessage)
    this.server
      .to(receiverSocketId)
      .emit(getSocketEvent('PUSH_DIRECT_MESSAGE'), pushedMessage)

    this.logger.debug(
      `direct message: ${data.sender_uuid} -> ${data.receiver_uuid}`
    )
  }

  @SubscribeMessage('pushMessage')
  async handleMessage(
    @MessageBody() data: SocketPushMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const message = await this.messageService.pushMessage(data)
      this.server.to(data.channel_uuid).emit('newMessage', message) // 채널에 메세지 전파
      this.logger.log(message.uuid, 'message create')
      this.logger.debug(
        `has client rooms ${client.rooms.has(data.channel_uuid)}`
      )
    } catch (error) {
      this.logger.error(error)
      client.emit('errorPacket', { error })
    }
  }

  @SubscribeMessage('loadMessage')
  async loadMessageLatest(
    @MessageBody() _data: LoadMessageDto,
    @ConnectedSocket() _client: Socket
  ) {
    // const messages = await this.messageService.fetchMessageFromLatest()
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { channel_uuid: string }) {
    this.logger.debug(`join client: ${client.id}, ${data.channel_uuid}`)
    client.join(data.channel_uuid)
  }
}
