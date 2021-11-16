import { Global, Module } from '@nestjs/common'

// Module
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SocketModule } from './socket/socket.module'
import { TeamModule } from './team/team.module'
import { FileModule } from './file/file.module'
import { JwtModule } from '@nestjs/jwt'
import { ChannelModule } from './channel/channel.module'
import { GrantModule } from './grant/grant.module'
import { TaskService } from './task/task.service'
import { ScheduleModule } from '@nestjs/schedule'

// entities
import { Message } from './entities/message'
import { Team } from './entities/team'
import { Channel } from './entities/channel'
import { User } from './entities/user'
import { UserGrant } from './entities/user_grant'
import { TeamUserProfile } from './entities/team_user_profile'
import { Reaction } from './entities/reaction'
import { ReactionItem } from './entities/reaction_item'
import { ReactModule } from './react/react.module'

const isProd = process.env.NODE_ENV === 'production'

@Global()
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
      synchronize: false,
      entities: [
        User,
        UserGrant,
        Team,
        Channel,
        Message,
        TeamUserProfile,
        Reaction,
        ReactionItem
      ],
      dropSchema: false
    }),
    UsersModule,
    TeamModule,
    AuthModule,
    SocketModule,
    FileModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      async useFactory(configService: ConfigService) {
        return new Promise((resolve, _reject) => {
          resolve({
            secret: configService.get('TO_SIGN'),
            privateKey: configService.get('TO_SIGN'),
            signOptions: {
              expiresIn: '1h',
              noTimestamp: false,
              mutatePayload: false
            }
          })
        })
      }
    }),
    ChannelModule,
    GrantModule,
    ScheduleModule.forRoot(),
    ReactModule
  ],
  providers: [JwtModule, TaskService],
  exports: [JwtModule]
})
export class AppModule {}
