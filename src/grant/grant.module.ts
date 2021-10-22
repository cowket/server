import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserGrant } from 'src/entities/user_grant'
import { GrantService } from './grant.service'

@Module({
  imports: [TypeOrmModule.forFeature([UserGrant])],
  providers: [GrantService],
  exports: [GrantService]
})
export class GrantModule {}
