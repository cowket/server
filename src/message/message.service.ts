import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FetchMessageDto, Message, PushMessageDto } from 'src/entities/message'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { User } from 'src/entities/user'
import { TeamService } from 'src/team/team.service'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

type MessageIncProfile = Message & {
  sender: User & {
    teamUserProfile?: TeamUserProfile | null
  }
}

@Injectable()
export class MessageService {
  private logger = new Logger()

  constructor(
    private utilService: UtilService,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(TeamUserProfile)
    private tupRepo: Repository<TeamUserProfile>,
    private teamService: TeamService
  ) {}

  async pushMessage(dto: PushMessageDto) {
    const uuid = this.utilService.genUuid()

    const tupCheck = await this.tupRepo
      .createQueryBuilder('tup')
      .where('tup.user_uuid = :userUuid', { userUuid: dto.senderUuid })
      .andWhere('tup.team_uuid = :teamUuid', { teamUuid: dto.teamUuid })
      .getOne()

    const tup: TeamUserProfile | null = tupCheck || null

    await this.messageRepo.insert({
      channel: dto.channelUuid as unknown,
      team: dto.teamUuid as unknown,
      sender: dto.senderUuid as unknown,
      content: dto.content,
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      is_updated: false,
      team_user_profile: tup || null
    })

    const message = await this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .leftJoinAndSelect('message.team_user_profile', 'team_user_profile')
      .where('message.uuid = :uuid', { uuid })
      .getOne()

    const teamUserProfile = (await this.teamService.getTeamUserProfile(
      dto.senderUuid,
      dto.teamUuid,
      true
    )) as TeamUserProfile | null

    const newMessage: MessageIncProfile = {
      ...message,
      sender: {
        ...message.sender,
        teamUserProfile
      }
    }

    return newMessage
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
}
