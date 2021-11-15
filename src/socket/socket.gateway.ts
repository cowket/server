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
  @UsePipes(new ValidationPipe())
  async loadMessageLatest(
    @MessageBody() data: LoadMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const messages = await this.messageService.fetchMessageFromLatest(data)
    client.emit(getSocketEvent('LOADED_SCROLL_MESSAGE'), messages)
  }

  @SubscribeMessage(getSocketEvent('JOIN_ROOM'))
  handleJoinRoom(client: Socket, data: { channel_uuid: string }) {
    client.join(data.channel_uuid)
  }

  @SubscribeMessage(getSocketEvent('DELETE_MESSAGE'))
  @UsePipes(new ValidationPipe())
  async deleteMessage(
    @MessageBody()
    data: {
      message_uuid: string
      channel_uuid: string
    },
    @ConnectedSocket() client: Socket
  ) {
    const userUuid = await this.userService.getUserUuidBySocketId(client.id)
    const isOwner = await this.messageService.isOwnerMessage(
      userUuid,
      data.message_uuid
    )
    if (!isOwner) {
      return client.emit('errorPacket', {
        message: '메세지의 소유자가 아닙니다.'
      })
    }
    await this.messageService.deleteMessage(data.message_uuid)
    client.emit(getSocketEvent('DELETED_MESSAGE'), {
      message_uuid: data.message_uuid
    })
    return this.server
      .to(data.channel_uuid)
      .emit(getSocketEvent('DELETED_MESSAGE'), {
        message_uuid: data.message_uuid
      })
  }
}
