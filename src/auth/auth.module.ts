import { Module } from '@nestjs/common'
import { UsersModule } from 'src/users/users.module'
import { AuthService } from './auth.service'

@Module({
  providers: [AuthService],
  imports: [UsersModule]
})
export class AuthModule {}
