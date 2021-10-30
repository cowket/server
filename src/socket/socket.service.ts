import { Injectable } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { ConnectedSession } from 'src/types/socket'

@Injectable()
export class SocketService {
  @WebSocketServer()
  private _server: Server
  private connectSession: ConnectedSession = {} // 게이트웨이에서 서비스로 이관

  setSocketServer(_server: Server) {
    this._server = _server
  }

  getSocketServer(): Server {
    return this._server
  }

  // getConnectSessionByTeamUuid(teamUuid: string) {}

  // getSocketIdByUserUuid(userUuid: string) {}

  // getUserUuidBySocketId(socketId: string) {}

  // setSession(teamUuid: string, userUuid: string, socketId: string) {}
}
