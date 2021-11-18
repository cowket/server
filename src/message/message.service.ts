import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Message } from 'src/entities/message'
import { Reaction } from 'src/entities/reaction'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { ReactService } from 'src/react/react.service'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'
import { LoadMessageDto, MessageType, PushMessageDto, RequestDirectMessageDto } from './message.dto'

type UpdateTupRequest = {
  teamUuid: string
  userUuid: string
  teamUserProfileId: number
}

@Injectable()
export class MessageService {
  private logger = new Logger()

  constructor(
    private utilService: UtilService,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(TeamUserProfile)
    private tupRepo: Repository<TeamUserProfile>,
    @InjectRepository(Reaction) private reactRepo: Repository<Reaction>,
    private reactService: ReactService
  ) {}

  async findMessageByUuid(uuid: string) {
    return this.messageRepo.findOne({ where: { uuid } })
  }

  async pushMessage(dto: PushMessageDto, type: MessageType = 'user') {
    const uuid = this.utilService.genUuid()

    const tupCheck = await this.tupRepo
      .createQueryBuilder('tup')
      .where('tup.user_uuid = :userUuid', { userUuid: dto.sender_uuid })
      .andWhere('tup.team_uuid = :teamUuid', { teamUuid: dto.team_uuid })
      .getOne()

    const tup: TeamUserProfile | null = tupCheck || null

    await this.messageRepo.insert({
      channel: { uuid: dto.channel_uuid },
      team: { uuid: dto.team_uuid },
      sender: { uuid: dto.sender_uuid },
      content: dto.content,
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      is_updated: false,
      sender_team_user_profile: tup,
      type: type || 'user'
    })

    const message = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.sender_team_user_profile', 'team_user_profile')
      .leftJoinAndSelect('message.reactions', 'reactions', 'reactions.message = message.uuid')
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .where('message.uuid = :uuid', { uuid })
      .getOne()

    return message
  }

  async pushDirectMessage(dto: RequestDirectMessageDto) {
    const uuid = this.utilService.genUuid()

    const senderTupCheck = await this.tupRepo
      .createQueryBuilder('tup')
      .where('tup.user_uuid = :userUuid', { userUuid: dto.sender_uuid })
      .andWhere('tup.team_uuid = :teamUuid', { teamUuid: dto.team_uuid })
      .getOne()

    const receiverTupCheck = await this.tupRepo
      .createQueryBuilder('tup')
      .where('tup.user_uuid = :userUuid', { userUuid: dto.receiver_uuid })
      .andWhere('tup.team_uuid = :teamUuid', { teamUuid: dto.team_uuid })
      .getOne()

    const senderTup = senderTupCheck || null
    const receiverTup = receiverTupCheck || null

    await this.messageRepo.insert({
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      sender: { uuid: dto.sender_uuid },
      receiver: { uuid: dto.receiver_uuid },
      content: dto.content,
      sender_team_user_profile: senderTup,
      receiver_team_user_profile: receiverTup,
      team: { uuid: dto.team_uuid }
    })

    const directMessage = await this.messageRepo
      .createQueryBuilder('direct_message')
      .leftJoinAndSelect('direct_message.team', 'team')
      .leftJoinAndSelect('direct_message.sender', 'sender')
      .leftJoinAndSelect('direct_message.receiver', 'receiver')
      .leftJoinAndSelect('direct_message.sender_team_user_profile', 'senderTup')
      .leftJoinAndSelect('direct_message.receiver_team_user_profile', 'receiverTup')
      .leftJoinAndSelect(
        'direct_message.reactions',
        'reactions',
        'reactions.direct_message = direct_message.uuid'
      )
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .where('direct_message.uuid = :uuid', { uuid })
      .getOne()

    return directMessage
  }

  async fetchDirectMessageLatest(sender: string, receiver: string, teamUuid: string) {
    return this.messageRepo
      .createQueryBuilder('dm')
      .leftJoinAndSelect('dm.team', 'team')
      .leftJoinAndSelect('dm.sender', 'sender')
      .leftJoinAndSelect('dm.receiver', 'receiver')
      .leftJoinAndSelect('dm.sender_team_user_profile', 'senderTup')
      .leftJoinAndSelect('dm.receiver_team_user_profile', 'receiverTup')
      .leftJoinAndSelect('dm.reactions', 'reactions', 'reactions.dm = dm.uuid')
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .orderBy('dm.create_date', 'DESC')
      .where('team.uuid = :teamUuid', { teamUuid })
      .andWhere(':sender IN (sender, receiver)', { sender })
      .andWhere(':receiver IN (sender, receiver)', { receiver })
      .limit(10)
      .printSql()
      .getMany()
  }

  async fetchMessageLatest(channelUuid: string) {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.sender_team_user_profile', 'team_user_profile')
      .leftJoinAndSelect('message.reactions', 'reactions', 'reactions.message = message.uuid')
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .orderBy('message.create_date', 'DESC')
      .where(`message.channel = '${channelUuid}'`)
      .limit(10)
      .getMany()
  }

  async fetchMessageFromLatest(data: LoadMessageDto) {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.sender_team_user_profile', 'team_user_profile')
      .leftJoinAndSelect('message.reactions', 'reactions', 'reactions.message = message.uuid')
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .orderBy('message.create_date', 'DESC')
      .where('message.team = :teamUuid', {
        teamUuid: data.topMessage.team.uuid
      })
      .andWhere('message.channel = :channelUuid', {
        channelUuid: data.topMessage.channel.uuid
      })
      .andWhere('TIMESTAMP(message.create_date, "%T") < TIMESTAMP(:compareDate, "%T")', {
        compareDate: data.topMessage.create_date
      })
      .andWhere('message.uuid != :messageUuid', {
        messageUuid: data.topMessage.uuid
      })
      .limit(10)
      .getMany()
  }

  async updateAllTup(req: UpdateTupRequest) {
    await this.updateAllTupInMessage(req)
    await this.updateAllTupInDirectMessage(req)
  }

  async updateAllTupInMessage({ teamUserProfileId, teamUuid, userUuid }: UpdateTupRequest) {
    return this.messageRepo
      .createQueryBuilder()
      .update()
      .set({ sender_team_user_profile: { id: teamUserProfileId } })
      .where('message.team_uuid = :teamUuid', { teamUuid })
      .andWhere('message.sender_uuid = :userUuid', { userUuid })
      .execute()
  }

  async updateAllTupInDirectMessage({ teamUserProfileId, teamUuid, userUuid }: UpdateTupRequest) {
    await this.messageRepo
      .createQueryBuilder()
      .update()
      .set({ sender_team_user_profile: { id: teamUserProfileId } })
      .where('direct_message.team = :teamUuid', { teamUuid })
      .andWhere('direct_message.message.sender = :userUuid', { userUuid })
      .execute()

    return this.messageRepo
      .createQueryBuilder()
      .update()
      .set({ receiver_team_user_profile: { id: teamUserProfileId } })
      .where('direct_message.team = :teamUuid', { teamUuid })
      .andWhere('direct_message.receiver = :userUuid', { userUuid })
      .execute()
  }

  async removeUnstableMessages() {
    return this.messageRepo
      .createQueryBuilder('m')
      .leftJoin('m.channel', 'channel')
      .leftJoin('m.sender', 'sender')
      .leftJoin('m.team', 'team')
      .delete()
      .where('team.uuid IS NULL')
      .andWhere('channel.uuid IS NULL')
      .andWhere('sender.uuid IS NULL')
      .andWhere('type = "user"')
      .execute()
  }

  async removeUnstableDirectMessages() {
    return this.messageRepo
      .createQueryBuilder('dm')
      .leftJoin('dm.sender', 'sender')
      .leftJoin('dm.receiver', 'receiver')
      .leftJoin('dm.team', 'team')
      .delete()
      .where('sender.uuid IS NULL')
      .andWhere('receiver.uuid IS NULL')
      .andWhere('team.uuid IS NULL')
      .execute()
  }

  async getMessageByUuid(uuid: string) {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.sender_team_user_profile', 'team_user_profile')
      .leftJoinAndSelect('message.reactions', 'reactions', 'reactions.message = message.uuid')
      .leftJoinAndSelect('reactions.reaction_item', 'reaction_item')
      .leftJoinAndSelect('reactions.user', 'reaction_user')
      .leftJoinAndSelect('reactions.team_user_profile', 'reaction_user_profile')
      .where('message.uuid = :uuid', { uuid })
      .getOne()
  }

  async deleteMessage(uuid: string) {
    await this.reactService.deleteReactions(uuid, 'message')
    return this.messageRepo.delete({ uuid })
  }

  async deleteDirectMessage(uuid: string) {
    await this.reactService.deleteReactions(uuid, 'dm')
    return this.messageRepo.delete({ uuid })
  }

  async isOwnerMessage(userUuid: string, messageUuid: string) {
    const message = await this.messageRepo.findOne({
      where: { sender: { uuid: userUuid }, uuid: messageUuid }
    })
    return !!message
  }
}
