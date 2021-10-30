import { Module } from '@nestjs/common'
import { SocketModule } from 'src/socket/socket.module'
import { HealthController } from './health.controller'

@Module({
  imports: [SocketModule],
  controllers: [HealthController]
})
export class HealthModule {}
