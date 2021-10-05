import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FetchMessageDto, Message, PushMessageDto } from 'src/entities/message'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

@Injectable()
export class MessageService {
  private logger = new Logger()

  constructor(
    private utilService: UtilService,
    @InjectRepository(Message) private messageRepo: Repository<Message>
  ) {}

  async pushMessage(dto: PushMessageDto) {
    const uuid = this.utilService.genUuid()

    await this.messageRepo.insert({
      channel: dto.channelUuid as unknown,
      team: dto.teamUuid as unknown,
      sender: dto.senderUuid as unknown,
      content: dto.content,
      uuid,
      create_date: new Date(),
      update_date: new Date(),
      is_updated: false
    })

    return this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.team', 'team')
      .leftJoinAndSelect('message.channel', 'channel')
      .leftJoinAndSelect('message.sender', 'users')
      .where('message.uuid = :uuid', { uuid })
      .getOne()
  }

  async fetchMessageFromLatest(message: FetchMessageDto) {
    return (
      this.messageRepo
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.team', 'team')
        .leftJoinAndSelect('message.channel', 'channel')
        .leftJoinAndSelect('message.sender', 'users')
        // .where('message.team = :teamUuid', {
        //   teamUuid: message.latestMessage.team.uuid
        // })
        // .andWhere('message.channel = :channelUuid', {
        //   channelUuid: message.latestMessage.channel.uuid
        // })
        .where('message.create_date < :compareDate', {
          compareDate: message.latestMessage.create_date
        })
        .limit(10)
        .getMany()
    )
  }
}
