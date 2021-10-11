import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(except: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient()
    this.handleError(client, except)
  }

  public handleError(client: Socket, except: HttpException | WsException) {
    client.emit('errorPacket', except)
  }
}
