import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Channel,
  CreateChannelDto,
  UpdateChannelDto,
  DeleteChannelDto
} from 'src/entities/channel'
import { UserGrant } from 'src/entities/user_grant'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel) private channelRepo: Repository<Channel>,
    @InjectRepository(UserGrant) private userGrantRepo: Repository<UserGrant>,
    private utilService: UtilService
  ) {}

  async grantAllChannel(userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('user_grant')
      .leftJoinAndSelect('user_grant.user_uuid', 'users')
      .leftJoinAndSelect('user_grant.team_uuid', 'team')
      .leftJoinAndSelect('user_grant.channel_uuid', 'channel')
      .innerJoinAndSelect('channel.owner', 'users_grant.user_uuid.uuid')
      .innerJoinAndSelect('team.owner', 'user_grant.user_uuid.uuid')
      .where('user_grant.user_uuid = :userUuid', { userUuid })
      .andWhere('user_grant.team_uuid = :teamUuid', { teamUuid })
      .andWhere('user_grant.channel_uuid IS NOT NULL')
      .getMany()
  }

  async grantCheck(userUuid: string, teamUuid: string) {
    const grant = await this.userGrantRepo.findOneOrFail({
      where: { user_uuid: userUuid, team_uuid: teamUuid }
    })
    return !!grant
  }

  async isExistChannel(channelUuid: string) {
    const channel = await this.channelRepo.findOne({
      where: { uuid: channelUuid }
    })

    return !!channel
  }

  async isChannelOwner(userUuid: string, channelUuid: string) {
    const channel = await this.channelRepo
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'users')
      .where({ uuid: channelUuid })
      .getOne()

    if (channel) return channel.owner.uuid === userUuid
    else return null
  }

  // 이름 중복체크
  async isDuplicatedName(teamUuid: string, check: string) {
    const duplicated = await this.channelRepo
      .createQueryBuilder('channel')
      .where('team_uuid = :teamUuid', { teamUuid })
      .andWhere('name = :name', { name: check })
      .getCount()

    return !!duplicated
  }

  async getChannelByUuid(uuid: string) {
    return this.channelRepo
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.owner', 'users')
      .leftJoinAndSelect('channel.team', 'team')
      .where(`channel.uuid = '${uuid}'`)
      .getOne()
  }

  async createChannel(userUuid: string, channelDto: CreateChannelDto) {
    const uuid = this.utilService.genUuid()

    await this.channelRepo.insert({
      uuid,
      name: channelDto.name,
      team: channelDto.team_uuid as unknown,
      description: channelDto.description || null,
      owner: userUuid as unknown,
      create_date: new Date(),
      update_date: new Date()
    })

    await this.createGrantChannel(userUuid, channelDto.team_uuid, uuid)
    const channel = await this.getChannelByUuid(uuid)

    return channel
  }

  async createGrantChannel(
    userUuid: string,
    teamUuid: string,
    channelUuid: string
  ) {
    return this.userGrantRepo.insert({
      channel_uuid: channelUuid as unknown,
      team_uuid: teamUuid as unknown,
      user_uuid: userUuid as unknown,
      create_date: new Date()
    })
  }

  async updateChannel(channelDto: UpdateChannelDto) {
    await this.channelRepo.save({
      uuid: channelDto.channel_uuid,
      name: channelDto.name,
      description: channelDto.description || null,
      update_date: new Date()
    })

    return this.getChannelByUuid(channelDto.channel_uuid)
  }

  async deleteChannel({ team_uuid, channel_uuid }: DeleteChannelDto) {
    return this.channelRepo.delete({
      uuid: channel_uuid,
      team: team_uuid as unknown
    })
  }
}
