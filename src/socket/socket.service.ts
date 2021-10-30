import { Injectable } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@Injectable()
export class SocketService {
  @WebSocketServer()
  private _server: Server

  setSocketServer(_server: Server) {
    this._server = _server
  }

  getSocketServer(): Server {
    return this._server
  }
}
