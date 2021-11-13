import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'src/entities/message'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { User } from 'src/entities/user'
import { Repository } from 'typeorm'

@Injectable()
export class ReactService {
  constructor(
    @InjectRepository(Reaction) private reactionRepo: Repository<Reaction>,
    @InjectRepository(ReactionItem)
    private reactionItemRepo: Repository<ReactionItem>
  ) {}

  async findReactionItemById(id: number) {
    return this.reactionItemRepo.findOne({ where: { id } })
  }

  async findReactionitemByContent(reaction: string) {
    return this.reactionItemRepo.findOne({ where: { content: reaction } })
  }

  async createReaction(
    message: Message,
    reaction: string,
    user: User,
    teamUserProfile: TeamUserProfile
  ) {
    const savedReaction = await this.saveReactionItem(reaction)

    return this.reactionRepo.insert({
      content: savedReaction,
      message,
      user,
      team_user_profile: teamUserProfile
    })
  }

  async saveReactionItem(reaction: string) {
    const reactionItem = await this.reactionItemRepo.findOne({
      where: { content: reaction }
    })

    if (reactionItem) return reactionItem

    return this.reactionItemRepo.save({
      content: reaction
    })
  }
}
