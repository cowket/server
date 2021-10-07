import { ArgumentsHost, Catch, HttpException } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(except: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient()
    console.log(client)
  }

  public handleError(client: Socket, except: HttpException | WsException) {
    console.log(client, except)
  }
}
