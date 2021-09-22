import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './jwt.strategy'
import { UtilModule } from 'src/util/util.module'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { JwtGuard } from './jwt.guard'

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
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
    UtilModule,
    JwtGuard
  ],
  controllers: [AuthController]
})
export class AuthModule {}
