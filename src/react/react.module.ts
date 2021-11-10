import { Module } from '@nestjs/common'
import { ReactService } from './react.service'

@Module({
  providers: [ReactService]
})
export class ReactModule {}
