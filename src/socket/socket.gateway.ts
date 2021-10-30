import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ChannelService } from 'src/channel/channel.service'
import { RequestDirectMessageDto } from 'src/entities/direct_message'
import { LoadMessageDto, SocketPushMessageDto } from 'src/entities/message'
import { MessageService } from 'src/message/message.service'
import { WsExceptionFilter } from './socket.filter'
import type { ConnectedSession } from 'src/types/socket'
import { SocketService } from './socket.service'

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
  private connected: ConnectedSession = {}
  private connectedByUuid: ConnectedSession = {}

  @WebSocketServer()
  server: Server

  constructor(
    private messageService: MessageService,
    private channelService: ChannelService,
    private socketService: SocketService
  ) {}

  afterInit(server: Server) {
    this.server = server
    this.socketService.setSocketServer(server)
  }

  @SubscribeMessage('cowket:connection')
  async handleCowketConnection(
    @MessageBody() data: { team_uuid: string; user_uuid: string },
    @ConnectedSocket() client: Socket
  ) {
    if (!this.connected[data.team_uuid]) {
      this.connected[data.team_uuid] = {}
      this.connectedByUuid[data.team_uuid] = {}
    }

    if (!this.connected[data.team_uuid][client.id]) {
      this.connected[data.team_uuid][client.id] = data.user_uuid
      this.connectedByUuid[data.team_uuid][data.user_uuid] = client.id
    }
  }

  @SubscribeMessage('pushDirectMessage')
  @UsePipes(new ValidationPipe())
  async handleDirectMessage(
    @MessageBody() data: RequestDirectMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const pushedMessage = await this.messageService.pushDirectMessage(data)
    this.server
      .to(this.connectedByUuid[data.team_uuid][data.receiver_uuid])
      .emit('newDirectMessage', pushedMessage)
    client.emit('newDirectMessage', pushedMessage)
  }

  @SubscribeMessage('pushMessage')
  async handleMessage(
    @MessageBody() data: SocketPushMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const message = await this.messageService.pushMessage(data)
      this.server.to(data.channelUuid).emit('newMessage', message) // 채널에 메세지 전파
      this.logger.log(message.uuid, 'message create')
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
  handleJoinRoom(client: Socket, data: any) {
    client.join(data.channel_uuid)
  }
}
