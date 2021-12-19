import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Channel, CreateChannelDto, UpdateChannelDto, DeleteChannelDto } from 'src/entities/channel'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { UserGrant } from 'src/entities/user_grant'
import { NotOwnerError, NotPrivateChannelError, UniqueChannelError } from 'src/error/error'
import { TeamService } from 'src/team/team.service'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'
import { MessageService } from 'src/message/message.service'
import { TokenUserInfo } from 'src/types/user'
import { UserService } from 'src/user/user.service'

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel) private channelRepo: Repository<Channel>,
    @InjectRepository(UserGrant) private userGrantRepo: Repository<UserGrant>,
    private utilService: UtilService,
    private messageService: MessageService,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    @Inject(forwardRef(() => TeamService)) private teamService: TeamService
  ) {}

  async grantAllChannel(userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('user_grant')
      .leftJoinAndSelect('user_grant.user', 'users')
      .leftJoinAndSelect('user_grant.team', 'team')
      .leftJoinAndSelect('user_grant.channel', 'channel')
      .innerJoinAndSelect('channel.owner', 'users_grant.user_uuid.uuid')
      .innerJoinAndSelect('team.owner', 'user_grant.user_uuid.uuid')
      .where('user_grant.user = :userUuid', { userUuid })
      .andWhere('user_grant.team = :teamUuid', { teamUuid })
      .andWhere('user_grant.channel IS NOT NULL')
      .getMany()
  }

  async grantCheck(userUuid: string, teamUuid: string) {
    const grant = await this.userGrantRepo.findOne({
      where: { user: { uuid: userUuid }, team: { uuid: teamUuid } }
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
      .where('channel.team = :teamUuid', { teamUuid })
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

  async getChannelByUuidDetail(uuid: string) {
    const members = await this.userGrantRepo
      .createQueryBuilder('user_grant')
      .leftJoinAndSelect('user_grant.user', 'users')
      .leftJoinAndSelect('user_grant.team_user_profile', 'tup')
      .where('user_grant.channel = :uuid', { uuid })
      .getMany()
    const channel = await this.getChannelByUuid(uuid)

    return {
      ...channel,
      members
    }
  }

  async getTeamByChannelUuid(uuid: string) {
    const channel = await this.channelRepo
      .createQueryBuilder('channel')
      .leftJoinAndSelect('channel.team', 'team')
      .where('channel.uuid = :uuid', { uuid })
      .getOne()

    return channel ? channel.team : null
  }

  async createChannel(userUuid: string, channelDto: CreateChannelDto) {
    const uuid = this.utilService.genUuid()
    const owner = await this.userService.findByUuid(userUuid)
    const team = await this.teamService.getTeamByUuid(channelDto.team_uuid)

    await this.channelRepo.insert({
      uuid,
      name: channelDto.name,
      team,
      description: channelDto.description || null,
      owner,
      is_private: channelDto.is_private || false
    })

    await this.createGrantChannel(userUuid, channelDto.team_uuid, uuid)
    const channel = await this.getChannelByUuid(uuid)

    return channel
  }

  async createGrantChannel(userUuid: string, teamUuid: string, channelUuid: string) {
    const tup = await this.teamService.getTeamUserProfile(userUuid, teamUuid, true)

    this.messageService.pushMessage(
      {
        channel_uuid: channelUuid,
        team_uuid: teamUuid,
        sender_uuid: null,
        content: '채널 개설됨'
      },
      'system'
    )

    const channel = await this.getChannelByUuid(channelUuid)
    const team = await this.teamService.getTeamByUuid(teamUuid)
    const user = await this.userService.findByUuid(userUuid)

    return this.userGrantRepo.insert({
      channel,
      team: team,
      user: user,
      team_user_profile: tup ? ((tup as TeamUserProfile).id as unknown) : null
    })
  }

  async updateChannel(channelDto: UpdateChannelDto) {
    await this.channelRepo.save({
      uuid: channelDto.channel_uuid,
      name: channelDto.name,
      description: channelDto.description || null
    })

    return this.getChannelByUuid(channelDto.channel_uuid)
  }

  async isUniqueChannel(teamUuid: string, channelUuid: string) {
    const channel = await this.channelRepo.findOne({
      where: { team: teamUuid, uuid: channelUuid }
    })

    return channel.unique
  }

  async deleteChannel({ team_uuid, channel_uuid }: DeleteChannelDto) {
    const isUnique = await this.isUniqueChannel(team_uuid, channel_uuid)

    if (isUnique) {
      throw new UniqueChannelError()
    }

    const team = await this.teamService.getTeamByUuid(team_uuid)

    return this.channelRepo.delete({
      uuid: channel_uuid,
      team
    })
  }

  async getAllChannel() {
    return this.channelRepo.find()
  }

  async createUniqueChannel(teamUuid: string, owner: string) {
    const _team = await this.teamService.getTeamByUuid(teamUuid)
    const _owner = await this.userService.findByUuid(owner)

    return this.channelRepo.save({
      uuid: this.utilService.genUuid(),
      description: '기본 채널',
      is_private: false,
      name: 'General',
      owner: _owner,
      team: _team,
      unique: true,
      update_date: new Date()
    })
  }

  async createGrantUniqueChannel(teamUuid: string, userUuid: string) {
    const unqiueChannel = await this.getUniqueChannel(teamUuid)
    return this.createGrantChannel(userUuid, teamUuid, unqiueChannel.uuid)
  }

  async getUniqueChannel(teamUuid: string) {
    const team = await this.teamService.getTeamByUuid(teamUuid)

    return this.channelRepo.findOne({
      relations: ['team'],
      where: { team, unique: true }
    })
  }

  async searchPublicChannel(keyword: string, teamUuid: string) {
    return this.channelRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.owner', 'owner')
      .leftJoinAndSelect('c.team', 'team')
      .where(`MATCH(name) AGAINST ('+${keyword}*' in boolean mode)`)
      .orWhere(`MATCH(description) AGAINST ('+${keyword}*' in boolean mode)`)
      .andWhere('team.uuid = :teamUuid', { teamUuid })
  }

  async getAllPublicChannel(teamUuid: string) {
    return this.channelRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.owner', 'owner')
      .leftJoin('c.team', 'team')
      .where('team.uuid = :teamUuid', { teamUuid })
      .andWhere('c.is_private = false')
      .getMany()
  }

  async checkPrivateChannelInfo(ownerUuid: string, channelUuid: string) {
    const channel = await this.getChannelByUuid(channelUuid)

    if (channel.owner.uuid !== ownerUuid) {
      throw new NotOwnerError()
    } else if (!channel.is_private) {
      throw new NotPrivateChannelError()
    }

    return channel
  }

  async getInvitableUserList(channelUuid: string, teamUuid: string) {
    const members = await this.userGrantRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.team_user_profile', 'tup')
      .leftJoinAndSelect('u.user', 'user')
      .leftJoin('u.team', 'team')
      .where('u.team = :teamUuid', { teamUuid })
      .andWhere('u.channel IS NULL')
      .getMany()

    const enteredMembers = await this.userGrantRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.team_user_profile', 'tup')
      .leftJoinAndSelect('u.user', 'user')
      .leftJoin('u.team', 'team')
      .leftJoin('u.channel', 'channel')
      .where('u.team = :teamUuid', { teamUuid })
      .andWhere('channel.uuid = :channelUuid', { channelUuid })
      .getMany()

    enteredMembers.forEach((member) => {
      const idx = members.findIndex((m) => m.id === member.id)
      members.splice(idx, 1)
    })

    return members
  }

  async invitePrivateChannel(userUuids: string[], channelUuid: string, teamUuid: string) {
    const teamUserProfiles = await this.teamService.getAllTeamUserProfile(userUuids, teamUuid)

    const insertArr = userUuids.map((userUuid) => {
      const tup = teamUserProfiles.find((t) => (t.user as unknown) === userUuid)

      const obj = {
        userUuid,
        tup: tup || null
      }

      return obj
    })

    let content = ''

    if (insertArr[0].tup) {
      content = `${insertArr[0].tup.name}님${
        insertArr.length > 1
          ? ` 외 ${insertArr.length - 1}명이 채널에 참여하였습니다.`
          : '이 채널에 참여하였습니다.'
      }`
    } else {
      const pUser = await this.userService.findByUuid(insertArr[0].userUuid)
      content = `${pUser.email.split('@')[0]}님${
        insertArr.length > 1
          ? ` 외 ${insertArr.length - 1}명이 채널에 참여하였습니다.`
          : '이 채널에 참여하였습니다.'
      }`
    }

    this.messageService.pushMessage({
      channel_uuid: channelUuid,
      sender_uuid: null,
      team_uuid: teamUuid,
      content
    })

    const channel = await this.getChannelByUuid(channelUuid)
    const team = await this.teamService.getTeamByUuid(teamUuid)

    return this.userGrantRepo
      .createQueryBuilder('grant')
      .insert()
      .into(UserGrant)
      .values(
        insertArr.map((user) => {
          return {
            channel_uuid: channel,
            team_uuid: team,
            user_uuid: {
              uuid: user.userUuid
            },
            team_user_profile: user.tup
          }
        })
      )
      .execute()
  }

  async isDuplicateGrantChannel(userUuid: string, teamUuid: string, channelUuid: string) {
    const [, count] = await this.userGrantRepo.findAndCount({
      where: {
        channel_uuid: channelUuid,
        user_uuid: userUuid,
        team_uuid: teamUuid
      }
    })

    return count > 0
  }

  async enterPublicChannel(user: TokenUserInfo, teamUuid: string, channelUuid: string) {
    const isDuplicate = await this.isDuplicateGrantChannel(user.uuid, teamUuid, channelUuid)

    if (isDuplicate) {
      return null
    }

    const tup = (await this.teamService.getTeamUserProfile(
      user.uuid,
      teamUuid,
      true
    )) as TeamUserProfile | null

    let displayName = ''

    if (!tup) {
      const pUser = await this.userService.findByUuid(user.uuid)
      displayName = pUser.email.split('@')[0]
    } else {
      displayName = tup.name
    }

    this.messageService.pushMessage({
      channel_uuid: channelUuid,
      sender_uuid: null,
      team_uuid: teamUuid,
      content: displayName + '님이 채널에 참여하였습니다.'
    })

    await this.userGrantRepo
      .createQueryBuilder('ug')
      .insert()
      .values({
        channel: {
          uuid: channelUuid
        },
        team_user_profile: tup ? { id: tup.id } : null,
        team: { uuid: teamUuid },
        user: { uuid: user.uuid }
      })
      .execute()

    return true
  }

  async hardDelete(teamUuid: string) {
    return this.channelRepo.delete({
      team: { uuid: teamUuid }
    })
  }

  // 채널에 참여중인 멤버를 모두 반환한다.
  // async getChannelMembers(channelUuid: string) {
  //   return this.userGrantRepo.createQueryBuilder('ug').leftJoinAndSelect('ug.user_uuid', 'users')
  // }
}
