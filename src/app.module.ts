import { Global, Module } from '@nestjs/common'

// Module
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { SocketModule } from './socket/socket.module'
import { TeamsModule } from './team/team.module'
import { FileModule } from './file/file.module'
import { JwtModule } from '@nestjs/jwt'

// entities
import { Message } from './entities/message'
import { Team } from './entities/team'
import { Channel } from './entities/channel'
import { User } from './entities/user'
import { UserGrant } from './entities/user_grant'
import { TeamUserProfile } from './entities/team_user_profile'

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
      // synchronize: !isProd,
      synchronize: false,
      entities: [User, UserGrant, Team, Channel, Message, TeamUserProfile],
      // dropSchema: !isProd,
      dropSchema: false,
      migrations: ['dist/migration/**/*.js'],
      cli: {
        entitiesDir: 'src/entities',
        migrationsDir: 'src/migration'
      }
    }),
    UsersModule,
    AuthModule,
    SocketModule,
    TeamsModule,
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
    })
  ],
  providers: [JwtModule],
  exports: [JwtModule]
})
export class AppModule {}
