import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserGrant } from 'src/entities/user_grant'
import { GrantService } from './grant.service'
import { GrantController } from './grant.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UserGrant])],
  providers: [GrantService],
  exports: [GrantService],
  controllers: [GrantController]
})
export class GrantModule {}
