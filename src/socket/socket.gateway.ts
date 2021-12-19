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
import { TeamUserProfile } from 'src/entities/team_user_profile'
import {
  LoadMessageDto,
  RequestDirectMessageDto,
  SocketPushMessageDto,
  UpdateMessageDto
} from 'src/message/message.dto'
import { MessageService } from 'src/message/message.service'
import { CreateReactionDto } from 'src/react/react.dto'
import { ReactService } from 'src/react/react.service'
import { TeamService } from 'src/team/team.service'
import { UserService } from 'src/user/user.service'
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
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('SocketGateway')

  @WebSocketServer()
  server: Server

  constructor(
    private messageService: MessageService,
    private socketService: SocketService,
    private userService: UserService,
    private reactService: ReactService,
    private teamService: TeamService
  ) {}

  afterInit(server: Server) {
    this.server = server
    this.socketService.setSocketServer(server)
  }

  handleConnection(client: Socket) {
    client.on(getSocketEvent('CONNECTION_WITH_AUTH'), async (data: { user_uuid: string }) => {
      await this.socketService.registerSocket(client.id, data.user_uuid)
    })
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
    const receiverSocketId = await this.userService.getSocketIdByUserUuid(data.receiver_uuid)

    client.emit(getSocketEvent('NEW_DIRECT_MESSAGE'), pushedMessage)
    this.server.to(receiverSocketId).emit(getSocketEvent('NEW_DIRECT_MESSAGE'), pushedMessage)

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
      this.server.to(data.channel_uuid).emit(getSocketEvent('NEW_MESSAGE'), message) // 채널에 메세지 전파
    } catch (error) {
      this.logger.error(error)
      client.emit('errorPacket', { error })
    }
  }

  @SubscribeMessage(getSocketEvent('LOAD_MESSAGE'))
  @UsePipes(new ValidationPipe())
  async loadMessageLatest(@MessageBody() data: LoadMessageDto, @ConnectedSocket() client: Socket) {
    try {
      const messages = await this.messageService.fetchMessageFromLatest(data)
      client.emit(getSocketEvent('LOADED_SCROLL_MESSAGE'), messages)
    } catch (error) {
      this.logger.log(error)
    }
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
    const userUuid = (await this.userService.getUserUuidBySocketId(client.id)) as string
    const isOwner = await this.messageService.isOwnerMessage(userUuid, data.message_uuid)
    if (!isOwner) {
      return client.emit('errorPacket', {
        message: '메세지의 소유자가 아닙니다.'
      })
    }
    await this.messageService.deleteMessage(data.message_uuid)
    client.emit(getSocketEvent('DELETED_MESSAGE'), {
      message_uuid: data.message_uuid
    })
    return this.server.to(data.channel_uuid).emit(getSocketEvent('DELETED_MESSAGE'), {
      message_uuid: data.message_uuid
    })
  }

  @SubscribeMessage(getSocketEvent('REACTION_MESSAGE'))
  @UsePipes(new ValidationPipe())
  async handleReaction(@MessageBody() data: CreateReactionDto, @ConnectedSocket() client: Socket) {
    try {
      const user = await this.userService.getUserUuidBySocketId(client.id)
      const tup = (await this.teamService.getTeamUserProfile(
        user,
        data.team_uuid,
        true
      )) as TeamUserProfile | null
      await this.reactService.createReaction(data.message_uuid, data.reaction, user, tup)
      const message = await this.messageService.getMessageByUuid(data.message_uuid)
      return this.server
        .to(data.channel_uuid)
        .emit(getSocketEvent('UPDATED_REACTION_MESSAGE'), message)
    } catch (error) {
      console.log(error)
      client.emit('errorPacket', error)
    }
  }

  @SubscribeMessage(getSocketEvent('UPDATE_MESSAGE'))
  @UsePipes(new ValidationPipe())
  async handleUpdateMessage(
    @MessageBody() data: UpdateMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
    } catch (error) {
      client.emit('errorPacket', error)
    }
  }
}
