import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'

@Module({
  providers: [AuthService, LocalStrategy],
  imports: [UsersModule, PassportModule, JwtModule.register({ secret: process.env.TO_SIGN })],
  controllers: [AuthController]
})
export class AuthModule {}
