import { IoAdapter } from '@nestjs/platform-socket.io'
import { ServerOptions } from 'socket.io'
import { createAdapter } from 'socket.io-redis'
import { RedisClient } from 'redis'

const pubClient = new RedisClient({ host: process.env.DB_HOST, port: 6379 })
const subClient = pubClient.duplicate()
const redisAdapter = createAdapter({ pubClient, subClient })

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options)
    server.adapter(redisAdapter)
    return server
  }
}
