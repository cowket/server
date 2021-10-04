import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UtilModule } from 'src/util/util.module'
import { MessageService } from './message.service'
import { Message } from 'src/entities/message'

@Module({
  imports: [UtilModule, TypeOrmModule.forFeature([Message])],
  providers: [MessageService],
  exports: [MessageService]
})
export class MessageModule {}
