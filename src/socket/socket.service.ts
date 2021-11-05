import { Injectable, Logger } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { TeamService } from 'src/team/team.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class SocketService {
  @WebSocketServer()
  private logger = new Logger()
  private _server: Server
  private connectSession = new Map<string, { [k: string]: string }>() // 게이트웨이에서 서비스로 이관

  constructor(
    private teamService: TeamService,
    private userService: UsersService
  ) {}

  setSocketServer(_server: Server) {
    this._server = _server
  }

  getSocketServer(): Server {
    return this._server
  }

  getServer() {
    return this._server
  }

  async initSessionAllTeams() {
    const allTeams = await this.teamService.getAllTeam()
    allTeams.forEach((team) => {
      this.connectSession.set(team.uuid, {})
    })
  }

  getConnectSessionByTeamUuid(teamUuid: string) {
    return this.connectSession.get(teamUuid)
  } // return team object

  getSocketIdByUserUuid(userUuid: string, teamUuid: string) {
    return this.getConnectSessionByTeamUuid(teamUuid)[userUuid]
  } // return socket id

  getUserUuidBySocketId(socketId: string, teamUuid: string) {
    return this.getConnectSessionByTeamUuid(teamUuid)[socketId]
  } // return user uuid\

  getSession() {
    return [...this.connectSession.entries()]
  } // return all entry for health check

  setSession(teamUuid: string, userUuid: string, socketId: string) {
    this.collect(teamUuid, userUuid)
    if (!this.connectSession.has(teamUuid)) {
      this.connectSession.set(teamUuid, {
        [userUuid]: socketId,
        [socketId]: userUuid
      })
    } else {
      this.connectSession.set(teamUuid, {
        ...this.connectSession.get(teamUuid),
        [userUuid]: socketId,
        [socketId]: userUuid
      })
    }
  }

  collect(teamUuid: string, userUuid: string) {
    const t = this.connectSession.get(teamUuid)

    for (const [k, v] of Object.entries(t)) {
      if (k === userUuid) delete t[userUuid]
      if (v === userUuid) delete t[k]
    }
  }

  async registerSocket(socketId: string, userUuid: string) {
    return this.userService.setSocketId(socketId, userUuid)
  }

  async removeSocket(socketId: string) {
    return this.userService.removeSocketId(socketId)
  }
}
