import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Alert } from 'src/entities/alert'
import { AlertService } from './alert.service'

@Module({
  imports: [TypeOrmModule.forFeature([Alert])],
  providers: [AlertService],
  exports: [AlertService]
})
export class AlertModule {}
