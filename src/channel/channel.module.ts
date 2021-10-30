import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from 'src/entities/channel'
import { UserGrant } from 'src/entities/user_grant'
import { UtilModule } from 'src/util/util.module'
import { ChannelController } from './channel.controller'
import { ChannelService } from './channel.service'
import { TeamModule } from 'src/team/team.module'
import { MessageModule } from 'src/message/message.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [
    UtilModule,
    TypeOrmModule.forFeature([UserGrant, Channel]),
    forwardRef(() => TeamModule),
    forwardRef(() => UsersModule),
    MessageModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService]
})
export class ChannelModule {}
