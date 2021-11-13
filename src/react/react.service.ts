import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { Repository } from 'typeorm'

@Injectable()
export class ReactService {
  constructor(
    @InjectRepository(Reaction) private reactionRepo: Repository<Reaction>,
    @InjectRepository(ReactionItem)
    private reactionItemRepo: Repository<ReactionItem>
  ) {}

  async createNewReactionItem(reaction: string) {
    const reactionItem = await this.reactionItemRepo.findOne({
      where: { content: reaction }
    })

    if (reactionItem) return reactionItem

    return this.reactionItemRepo.save({
      content: reaction
    })
  }
}
