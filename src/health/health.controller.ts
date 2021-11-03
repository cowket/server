import { Controller, Get } from '@nestjs/common'
import { SocketService } from 'src/socket/socket.service'

@Controller('health')
export class HealthController {
  constructor(private socketService: SocketService) {}

  @Get('session')
  getSessionHealth() {
    return this.socketService.getSession()
  }

  @Get('sockets')
  async getSocketStatus() {
    const server = this.socketService.getServer()
    const sockets = await server.allSockets()
    const result = []
    for (const o of sockets.keys()) {
      result.push(o)
    }
    return result
  }
}
