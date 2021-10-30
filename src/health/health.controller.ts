import { Controller, Get } from '@nestjs/common'
import { SocketService } from 'src/socket/socket.service'

@Controller('health')
export class HealthController {
  constructor(private socketService: SocketService) {}

  @Get('session')
  getSessionHealth() {
    return this.socketService.getSession()
  }
}
