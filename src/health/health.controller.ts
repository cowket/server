import { Controller, Get } from '@nestjs/common'
import { SocketService } from 'src/socket/socket.service'

@Controller('health')
export class HealthController {
  constructor(private socketService: SocketService) {}

  @Get('sockets')
  async getSocketStatus() {
    const server = this.socketService.getSocketServer()
    const sockets = await server.allSockets()
    const result = []
    for (const o of sockets.keys()) {
      result.push(o)
    }
    return result
  }
}
