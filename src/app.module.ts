import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SocketGateway } from './socket/socket.gateway'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { User } from './entities/user'
import { UserGrant } from './entities/user_grant'

const isProd = process.env.NODE_ENV === 'production'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isProd ? '.env.production' : '.env',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_NAME,
      synchronize: !isProd,
      entities: [User, UserGrant],
      dropSchema: !isProd
    }),
    AuthModule,
    UsersModule
  ],
  providers: [SocketGateway]
})
export class AppModule {}
