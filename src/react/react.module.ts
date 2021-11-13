import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { ReactService } from './react.service'

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, ReactionItem])],
  providers: [ReactService]
})
export class ReactModule {}
