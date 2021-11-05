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
      getSocketEvent('CONNECTION_WITH_AUTH'),
      async (data: { user_uuid: string }) => {
        await this.socketService.registerSocket(client.id, data.user_uuid)
      }
    )
  }

  async handleDisconnect(client: Socket) {
    await this.socketService.removeSocket(client.id)
  }

  @SubscribeMessage(getSocketEvent('PUSH_DIRECT_MESSAGE'))
  @UsePipes(new ValidationPipe())
  async handleDirectMessage(
    @MessageBody() data: RequestDirectMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const pushedMessage = await this.messageService.pushDirectMessage(data)
    const receiverSocketId = await this.userService.getSocketIdByUserUuid(
      data.receiver_uuid
    )

    client.emit(getSocketEvent('NEW_DIRECT_MESSAGE'), pushedMessage)
    this.server
      .to(receiverSocketId)
      .emit(getSocketEvent('NEW_DIRECT_MESSAGE'), pushedMessage)

    this.logger.debug(
      `direct message: ${data.sender_uuid}(${client.id}) -> ${data.receiver_uuid}(${receiverSocketId})`
    )
  }

  @SubscribeMessage(getSocketEvent('PUSH_MESSAGE'))
  async handleMessage(
    @MessageBody() data: SocketPushMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const message = await this.messageService.pushMessage(data)
      this.server
        .to(data.channel_uuid)
        .emit(getSocketEvent('NEW_MESSAGE'), message) // 채널에 메세지 전파
    } catch (error) {
      this.logger.error(error)
      client.emit('errorPacket', { error })
    }
  }

  @SubscribeMessage(getSocketEvent('LOAD_MESSAGE'))
  async loadMessageLatest(
    @MessageBody() _data: LoadMessageDto,
    @ConnectedSocket() _client: Socket
  ) {
    // const messages = await this.messageService.fetchMessageFromLatest()
  }

  @SubscribeMessage(getSocketEvent('JOIN_ROOM'))
  handleJoinRoom(client: Socket, data: { channel_uuid: string }) {
    client.join(data.channel_uuid)
  }
}
