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
import { RequestDirectMessageDto } from 'src/entities/direct_message'
import { LoadMessageDto, SocketPushMessageDto } from 'src/entities/message'
import { MessageService } from 'src/message/message.service'
import { WsExceptionFilter } from './socket.filter'
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

  @WebSocketServer()
  server: Server

  constructor(
    private messageService: MessageService,
    private socketService: SocketService
  ) {}

  afterInit(server: Server) {
    this.server = server
    this.socketService.setSocketServer(server)
    this.socketService.initSessionAllTeams()
  }

  @SubscribeMessage('cowket:connection')
  @UsePipes(new ValidationPipe())
  handleCowketConnection(
    @MessageBody() data: { team_uuid: string; user_uuid: string },
    @ConnectedSocket() client: Socket
  ) {
    this.socketService.setSession(data.team_uuid, data.user_uuid, client.id)
  }

  @SubscribeMessage('pushDirectMessage')
  @UsePipes(new ValidationPipe())
  async handleDirectMessage(
    @MessageBody() data: RequestDirectMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    const pushedMessage = await this.messageService.pushDirectMessage(data)
    this.server
      .to(
        this.socketService.getSocketIdByUserUuid(
          data.receiver_uuid,
          data.team_uuid
        )
      )
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
  handleJoinRoom(client: Socket, data: any) {
    this.logger.debug(`join client: ${client.id}, ${data.channel_uuid}`)
    client.join(data.channel_uuid)
  }
}
