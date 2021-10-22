import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from 'src/entities/channel'
import { UserGrant } from 'src/entities/user_grant'
import { UtilModule } from 'src/util/util.module'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'
import { GrantModule } from 'src/grant/grant.module'
import { TeamModule } from 'src/team/team.module'

@Module({
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([UserGrant, Channel]),
    GrantModule,
    forwardRef(() => TeamModule)
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService]
})
export class ChannelModule {}
