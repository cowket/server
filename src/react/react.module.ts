import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { ReactService } from './react.service'
import { ReactController } from './react.controller'
import { UtilModule } from 'src/util/util.module'

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, ReactionItem]), UtilModule],
  providers: [ReactService],
  exports: [ReactService],
  controllers: [ReactController]
})
export class ReactModule {}
