import { Module } from '@nestjs/common'
import { AnonymousController } from './anonymous.controller'
import { AnonymousService } from './anonymous.service'

@Module({
  controllers: [AnonymousController],
  providers: [AnonymousService]
})
export class AnonymousModule {}
