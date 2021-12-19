import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RequestTeamData, Team, UpdateTeamData } from 'src/entities/team'
import {
  CombineUser,
  RequestTeamUserProfile,
  TeamUserProfile
} from 'src/entities/team_user_profile'
import { UserService } from 'src/user/user.service'
import { UtilService } from 'src/util/util.service'
import { In, Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { User } from 'src/entities/user'
import { ChannelService } from 'src/channel/channel.service'
import { MessageService } from 'src/message/message.service'
import { GrantService } from 'src/grant/grant.service'

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepository: Repository<Team>,
    @InjectRepository(TeamUserProfile)
    private teamUserProfileRepo: Repository<TeamUserProfile>,
    private userService: UserService,
    private utilService: UtilService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @Inject(forwardRef(() => ChannelService))
    private channelService: ChannelService,
    private messageService: MessageService,
    private grantService: GrantService
  ) {}

  async deleteTeam(teamUuid: string, userUuid: string) {
    const team = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoin('team.owner', 'owner')
      .where('owner.uuid = :userUuid AND team.uuid = :teamUuid', { userUuid, teamUuid })
      .getOne()

    if (team) {
      await this.messageService.hardDelete(teamUuid)
      await this.channelService.hardDelete(team.uuid)
      await this.teamRepository.delete({ uuid: teamUuid })
      await this.grantService.removeGrantAllUserInTeam(team.uuid)
      return true
    } else {
      return false
    }
  }

  async getTeamByUuid(uuid: string): Promise<Team> {
    return this.teamRepository.findOne({
      relations: ['owner'],
      where: { uuid }
    })
  }

  async getAllTeamsByUser(uuid: string): Promise<Team[]> {
    const teams = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .where({ owner: { uuid } })
      .getMany()
    return teams
  }

  async createTeam(createTeam: RequestTeamData, userUuid: string) {
    const { name, description, is_private, password } = createTeam
    let encryptPw = null

    if (is_private && password) {
      const salt = bcrypt.genSaltSync(parseInt(this.configService.get('SE_SALT')))
      encryptPw = bcrypt.hashSync(password, salt)
    }

    const genTeamUuid = this.utilService.genUuid()

    const user = await this.userService.findByUuid(userUuid)
    const identicon = this.utilService.genAvatar(genTeamUuid)

    await this.teamRepository.insert({
      name,
      owner: user,
      uuid: genTeamUuid,
      is_private,
      description,
      password: encryptPw,
      avatar: identicon
    })

    const uniqueChannel = await this.channelService.createUniqueChannel(genTeamUuid, userUuid)
    await this.channelService.createGrantChannel(userUuid, genTeamUuid, uniqueChannel.uuid)

    const insertedTeam = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .where({ uuid: genTeamUuid })
      .getOne()

    return insertedTeam
  }

  async isExistTeamName(teamName: string): Promise<boolean> {
    try {
      const isExistTeam = await this.teamRepository.findOne({
        where: { name: teamName }
      })
      return !!isExistTeam
    } catch (error) {
      return false
    }
  }

  async getCountTeam(uuid: string): Promise<number> {
    return this.teamRepository
      .createQueryBuilder('team')
      .where('team.uuid = :uuid', { uuid })
      .getCount()
  }

  async updateTeam(uuid: string, data: UpdateTeamData) {
    const { is_private, name, avatar } = data

    await this.teamRepository.save({
      is_private,
      name,
      uuid,
      avatar: avatar || null,
      update_date: new Date()
    })

    return this.getTeamByUuid(uuid)
  }

  async isOwnerOfTeam(userUuid: string, teamUuid: string): Promise<boolean> {
    const isOwner = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .where('team.uuid = :teamUuid', { teamUuid })
      .andWhere('users.uuid = :userUuid', { userUuid })
      .getCount()

    return !!isOwner
  }

  async searchTeamByKeyword(keyword: string) {
    return this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .select()
      .where(`MATCH(name) AGAINST ('+${keyword}*' in boolean mode)`)
      .orWhere(`MATCH(description) AGAINST ('+${keyword}*' in boolean mode)`)
      .getMany()
  }

  async getIsExistTeamUserProfile(uuid: string, teamUuid: string) {
    const profileCount = await this.teamUserProfileRepo
      .createQueryBuilder('team_user_profile')
      .where(`team_user_profile.user = '${uuid}'`)
      .andWhere(`team_user_profile.team = '${teamUuid}'`)
      .getOne()

    return profileCount || false
  }

  async getTeamUserProfile(uuid: string, teamUuid: string, nullable = false) {
    const userBaseProfile = await this.userService.findByUuid(uuid)
    if (!userBaseProfile) return null
    const isExist = await this.getIsExistTeamUserProfile(uuid, teamUuid)
    if (nullable) return isExist || null
    return isExist || userBaseProfile
  }

  async getTeamUserProfileSimple(uuid: string, teamUuid: string): Promise<TeamUserProfile | null> {
    const teamUserProfile = await this.getIsExistTeamUserProfile(uuid, teamUuid)
    return teamUserProfile || null
  }

  async getAllTeam() {
    return this.teamRepository.find()
  }

  async createTeamUserProfile(profile: RequestTeamUserProfile, userUuid: string) {
    const user = await this.userService.findByUuid(userUuid)
    const team = await this.getTeamByUuid(profile.team_uuid)

    if (profile.avatar) {
      profile.avatar = this.utilService.getUploadHttpPath(true) + profile.avatar
    }

    const tup = await this.teamUserProfileRepo.save({
      ...profile,
      user_uuid: user,
      team_uuid: team
    })

    await this.messageService.updateAllTup({
      teamUserProfileId: tup.id,
      teamUuid: profile.team_uuid,
      userUuid
    })

    await this.grantService.updateAllTup(tup.id, user.uuid, team.uuid)

    return tup
  }

  async updateTeamUserProfile(profile: RequestTeamUserProfile, userUuid: string) {
    const teamUserProfile = await this.teamUserProfileRepo.findOne({
      where: { user_uuid: userUuid, team_uuid: profile.team_uuid }
    })

    if (profile.avatar) {
      profile.avatar = this.utilService.getUploadHttpPath(true) + profile.avatar
    }

    return this.teamUserProfileRepo.save({
      id: teamUserProfile.id,
      avatar: profile.avatar || null,
      contact: profile.contact || null,
      name: profile.name,
      position: profile.position
    })
  }

  async getTeamPublicType(teamUuid: string) {
    const { is_private } = await this.teamRepository.findOne({
      where: { uuid: teamUuid },
      select: ['is_private']
    })

    return is_private
  }

  async enterPublicTeam(userUuid: string, teamUuid: string) {
    const team = await this.getTeamByUuid(teamUuid)
    const user = await this.userService.findByUuid(userUuid)
    await this.channelService.createGrantUniqueChannel(teamUuid, userUuid)
    return this.grantService.createGrantTeam(user.uuid, team.uuid)
  }

  async enterPrivateTeam(userUuid: string, teamUuid: string, password: string) {
    const isCorretPw = await this.isCorrectPrivateTeamPassword(teamUuid, password)
    await this.channelService.createGrantUniqueChannel(teamUuid, userUuid)

    if (isCorretPw) {
      return this.enterPublicTeam(userUuid, teamUuid)
    } else {
      return null
    }
  }

  async isCorrectPrivateTeamPassword(teamUuid: string, password: string) {
    const { password: teamPw } = await this.teamRepository.findOne({
      where: { uuid: teamUuid },
      select: ['password']
    })

    return bcrypt.compareSync(password, teamPw)
  }

  async getAllUserProfile(teamUuid: string, userUuids: string[]) {
    const allUsers = await this.userRepo
      .createQueryBuilder('users')
      .where({ uuid: In(userUuids) })
      .getMany()

    const teamUserProfiles = await this.teamUserProfileRepo
      .createQueryBuilder('team_user_profile')
      .leftJoinAndSelect('team_user_profile.user', 'user')
      .where('team = :teamUuid', { teamUuid })
      .getMany()

    const combineUser: CombineUser[] = allUsers.map((user) => {
      return {
        ...user,
        team_profile: teamUserProfiles.find((profile) => profile.user.uuid === user.uuid) || null
      }
    })

    return combineUser
  }

  async getAllTeamUserProfile(userUuids: string[], teamUuid: string) {
    return this.teamUserProfileRepo
      .createQueryBuilder('tup')
      .where('tup.team = :teamUuid', { teamUuid })
      .andWhere('tup.user IN (:userUuids)', { userUuids })
      .getMany()
  }
}
