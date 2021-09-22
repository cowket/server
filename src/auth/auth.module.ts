import { Global, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'
import { LocalStrategy } from './local.strategy'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { UtilModule } from 'src/util/util.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/entities/user'

@Global()
@Module({
  exports: [AuthService],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    UtilModule
  ],
  controllers: [AuthController]
})
export class AuthModule {}
