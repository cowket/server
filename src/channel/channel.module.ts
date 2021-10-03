import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from 'src/entities/channel'
import { UserGrant } from 'src/entities/user_grant'
import { UtilModule } from 'src/util/util.module'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'

@Module({
  imports: [UtilModule, TypeOrmModule.forFeature([UserGrant, Channel])],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService]
})
export class ChannelModule {}
