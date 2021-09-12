import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { User } from './entities/user'
import { UserGrant } from './entities/user_grant'
import { UtilModule } from './util/util.module'
import { SocketModule } from './socket/socket.module'
import { Team } from './entities/team'
import { TeamsModule } from './team/team.module'

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
      // synchronize: !isProd,
      synchronize: false,
      entities: [User, UserGrant, Team],
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
    TeamsModule
  ],
  providers: []
})
export class AppModule {}
