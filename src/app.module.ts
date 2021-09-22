import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { User } from './entities/user'
import { UserGrant } from './entities/user_grant'
import { UtilModule } from './util/util.module'
import { SocketModule } from './socket/socket.module'
import { Team } from './entities/team'
import { TeamsModule } from './team/team.module'
import { Channel } from './entities/channel'
import { FileModule } from './file/file.module'
import { JwtModule } from '@nestjs/jwt'
import { JwtGuard } from './auth/jwt.guard'
import { APP_GUARD } from '@nestjs/core'

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
      entities: [User, UserGrant, Team, Channel],
      // dropSchema: !isProd,
      dropSchema: false,
      migrations: ['dist/migration/**/*.js'],
      cli: {
        entitiesDir: 'src/entities',
        migrationsDir: 'src/migration'
      }
    }),
    UtilModule,
    AuthModule,
    UsersModule,
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
  providers: [JwtModule, { useClass: JwtGuard, provide: APP_GUARD }],
  exports: [JwtModule]
})
export class AppModule {}
