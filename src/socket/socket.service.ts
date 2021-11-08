import { Injectable, Logger } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class SocketService {
  @WebSocketServer()
  private logger = new Logger(SocketService.name)
  private _server: Server

  constructor(private userService: UsersService) {}

  setSocketServer(_server: Server) {
    this._server = _server
  }

  getSocketServer(): Server {
    return this._server
  }

  async registerSocket(socketId: string, userUuid: string) {
    return this.userService.setSocketId(socketId, userUuid)
  }

  async removeSocket(socketId: string) {
    return this.userService.removeSocketId(socketId)
  }
}
