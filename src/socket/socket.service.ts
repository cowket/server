import { Injectable, Logger } from '@nestjs/common'
import { WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { TeamService } from 'src/team/team.service'

@Injectable()
export class SocketService {
  @WebSocketServer()
  private logger = new Logger()
  private _server: Server
  private connectSession = new Map<string, { [k: string]: string }>() // 게이트웨이에서 서비스로 이관

  constructor(private teamService: TeamService) {}

  setSocketServer(_server: Server) {
    this._server = _server
  }

  getSocketServer(): Server {
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
}
