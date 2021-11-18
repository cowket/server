import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

@Injectable()
export class ReactService {
  constructor(
    @InjectRepository(Reaction) private reactionRepo: Repository<Reaction>,
    @InjectRepository(ReactionItem)
    private reactionItemRepo: Repository<ReactionItem>,
    private utilService: UtilService
  ) {}

  async findReactionItemById(id: number) {
    return this.reactionItemRepo.findOne({ where: { id } })
  }

  async findReactionitemByContent(reaction: string) {
    return this.reactionItemRepo.findOne({ where: { content: reaction } })
  }

  async createReaction(
    messageUuid: string,
    reaction: string,
    userUuid: string,
    teamUserProfile: TeamUserProfile | null
  ) {
    const savedReaction = await this.saveReactionItem(reaction)

    // 리액션이 이미 있으면 삭제
    const exist = await this.reactionRepo.findOne({
      where: { message: { uuid: messageUuid }, user: { uuid: userUuid } }
    })

    if (exist) {
      await this.reactionRepo.delete({ uuid: exist.uuid })

      return true
    }

    await this.reactionRepo.insert({
      uuid: this.utilService.genUuid(),
      reaction_item: savedReaction,
      message: { uuid: messageUuid },
      user: { uuid: userUuid },
      team_user_profile: teamUserProfile || null
    })

    return true
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

  async findReactions(uuid: string) {
    return this.reactionRepo.find({
      where: { message: { uuid } },
      relations: ['reaction_item', 'user', 'team_user_profile'],
      select: ['reaction_item', 'create_date', 'team_user_profile', 'user', 'uuid']
    })
  }

  async deleteReactions(messageUuid: string, matchType: 'message' | 'dm') {
    return this.reactionRepo.delete({
      message: { uuid: messageUuid },
      match_type: matchType
    })
  }
}
