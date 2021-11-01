import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  DirectMessage,
  RequestDirectMessageDto
} from 'src/entities/direct_message'
import {
  FetchMessageDto,
  Message,
  MessageType,
  PushMessageDto
} from 'src/entities/message'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

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
    @InjectRepository(DirectMessage) private dmRepo: Repository<DirectMessage>
  ) {}

  async pushMessage(dto: PushMessageDto, type: MessageType = 'user') {
    const uuid = this.utilService.genUuid()

    const tupCheck = await this.tupRepo
      .createQueryBuilder('tup')
      .where('tup.user_uuid = :userUuid', { userUuid: dto.sender_uuid })
      .andWhere('tup.team_uuid = :teamUuid', { teamUuid: dto.team_uuid })
      .getOne()

    const tup: TeamUserProfile | null = tupCheck || null

    await this.messageRepo.insert({
      channel: dto.channel_uuid as unknown,
      team: dto.team_uuid as unknown,
      sender: dto.sender_uuid as unknown,
      content: dto.content,
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      is_updated: false,
      team_user_profile: tup,
      type: type || 'user'
    })

    const message = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.team_user_profile', 'team_user_profile')
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

    await this.dmRepo.insert({
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      sender: dto.sender_uuid as unknown,
      receiver: dto.receiver_uuid as unknown,
      content: dto.content,
      sender_team_user_profile: senderTup,
      receiver_team_user_profile: receiverTup,
      team: dto.team_uuid as unknown
    })

    const directMessage = await this.dmRepo
      .createQueryBuilder('direct_message')
      .leftJoinAndSelect('direct_message.team', 'team')
      .leftJoinAndSelect('direct_message.sender', 'sender')
      .leftJoinAndSelect('direct_message.receiver', 'receiver')
      .leftJoinAndSelect('direct_message.sender_team_user_profile', 'senderTup')
      .leftJoinAndSelect(
        'direct_message.receiver_team_user_profile',
        'receiverTup'
      )
      .where('direct_message.uuid = :uuid', { uuid })
      .getOne()

    return directMessage
  }

  async fetchDirectMessageLatest(
    sender: string,
    receiver: string,
    teamUuid: string
  ) {
    return this.dmRepo
      .createQueryBuilder('dm')
      .leftJoinAndSelect('dm.team', 'team')
      .leftJoinAndSelect('dm.sender', 'sender')
      .leftJoinAndSelect('dm.receiver', 'receiver')
      .leftJoinAndSelect('dm.sender_team_user_profile', 'senderTup')
      .leftJoinAndSelect('dm.receiver_team_user_profile', 'receiverTup')
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
      .leftJoinAndSelect('message.team_user_profile', 'team_user_profile')
      .orderBy('message.create_date', 'DESC')
      .where(`message.channel = '${channelUuid}'`)
      .limit(10)
      .getMany()
  }

  async fetchMessageFromLatest(message: FetchMessageDto) {
    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.team_user_profile', 'team_user_profile')
      .orderBy('message.create_date', 'DESC')
      .where('message.team = :teamUuid', {
        teamUuid: message.latestMessage.team.uuid
      })
      .andWhere('message.channel = :channelUuid', {
        channelUuid: message.latestMessage.channel.uuid
      })
      .andWhere('message.create_date < :compareDate', {
        compareDate: message.latestMessage.create_date
      })
      .limit(10)
      .getMany()
  }

  async updateAllTup(req: UpdateTupRequest) {
    this.updateAllTupInMessage(req)
    this.updateAllTupInDirectMessage(req)
  }

  async updateAllTupInMessage({
    teamUserProfileId,
    teamUuid,
    userUuid
  }: UpdateTupRequest) {
    return this.messageRepo
      .createQueryBuilder('m')
      .update('SET m.team_user_profile = :teamUserProfileId', {
        teamUserProfileId
      })
      .where('m.team_uuid = :teamUuid', { teamUuid })
      .andWhere('m.sender_uuid = :userUuid', { userUuid })
      .execute()
  }

  async updateAllTupInDirectMessage({
    teamUserProfileId,
    teamUuid,
    userUuid
  }: UpdateTupRequest) {
    this.dmRepo
      .createQueryBuilder('m')
      .update('SET m.sender_team_user_profile = :teamUserProfileId', {
        teamUserProfileId
      })
      .where('m.team_uuid = :teamUuid', { teamUuid })
      .andWhere('m.sender = :userUuid', { userUuid })
      .execute()

    this.dmRepo
      .createQueryBuilder('m')
      .update('SET m.receiver_team_user_profile = :teamUserProfileId', {
        teamUserProfileId
      })
      .where('m.team_uuid = :teamUuid', { teamUuid })
      .andWhere('m.receiver = :userUuid', { userUuid })
      .execute()
  }
}
