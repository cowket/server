import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RequestTeamData, Team, UpdateTeamData } from 'src/entities/team'
import {
  CombineUser,
  RequestTeamUserProfile,
  TeamUserProfile
} from 'src/entities/team_user_profile'
import { UserGrant } from 'src/entities/user_grant'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { In, Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { User } from 'src/entities/user'

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepository: Repository<Team>,
    @InjectRepository(TeamUserProfile)
    private teamUserProfileRepo: Repository<TeamUserProfile>,
    @InjectRepository(UserGrant)
    private userGrantRepo: Repository<UserGrant>,
    private usersService: UsersService,
    private utilService: UtilService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  async deleteTeam(teamUuid: string, userUuid: string) {
    const team = await this.teamRepository
      .createQueryBuilder('team')
      .where({ owner: { uuid: userUuid }, uuid: teamUuid })
      .getOne()

    if (team) {
      await this.teamRepository.delete({ uuid: teamUuid })
      await this.userGrantRepo
        .createQueryBuilder('user_grant')
        .leftJoin('user_grant.team_uuid', 'team')
        .where('team_uuid = :teamUuid', { teamUuid })
        .delete()
        .execute()
      return true
    } else {
      return false
    }
  }

  async getTeamByUuid(uuid: string): Promise<Team> {
    return this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .where('team.uuid = :uuid', { uuid })
      .getOne()
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
      const salt = bcrypt.genSaltSync(
        parseInt(this.configService.get('SE_SALT'))
      )
      encryptPw = bcrypt.hashSync(password, salt)
    }

    const user = await this.usersService.findByUuid(userUuid)
    const team = await this.teamRepository.insert({
      create_date: new Date(),
      update_date: new Date(),
      name,
      owner: user,
      uuid: this.utilService.genUuid(),
      is_private,
      description,
      password: encryptPw
    })
    const insertedTeam = await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'users')
      .where({ uuid: team.generatedMaps[0].uuid })
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
      .where(`team_user_profile.user_uuid = '${uuid}'`)
      .andWhere(`team_user_profile.team_uuid = '${teamUuid}'`)
      .getOne()

    return profileCount || false
  }

  async getTeamUserProfile(uuid: string, teamUuid: string) {
    const userBaseProfile = await this.usersService.findByUuid(uuid)
    if (!userBaseProfile) return null
    const isExist = await this.getIsExistTeamUserProfile(uuid, teamUuid)
    return isExist || userBaseProfile
  }

  async getGrantsUserInTeam(teamUuid: string) {
    const grantUserUuids = await this.userGrantRepo
      .createQueryBuilder('grant')
      .where('grant.team_uuid = :teamUuid', { teamUuid })
      .getMany()

    // @ts-expect-error User[] -> string[]
    return grantUserUuids.map((user) => user.user_uuid) as string[]
  }

  async getAllTeam() {
    return this.teamRepository.find()
  }

  async createTeamUserProfile(
    profile: RequestTeamUserProfile,
    userUuid: string
  ) {
    const user = await this.usersService.findByUuid(userUuid)
    const team = await this.getTeamByUuid(profile.team_uuid)

    return this.teamUserProfileRepo.insert({
      ...profile,
      user_uuid: user,
      team_uuid: team
    })
  }

  async updateTeamUserProfile(
    profile: RequestTeamUserProfile,
    userUuid: string
  ) {
    const teamUserProfile = await this.teamUserProfileRepo.findOne({
      where: { user_uuid: userUuid, team_uuid: profile.team_uuid }
    })

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
    const user = await this.usersService.findByUuid(userUuid)

    return this.userGrantRepo.insert({
      channel_uuid: null,
      create_date: new Date(),
      team_uuid: team,
      user_uuid: user
    })
  }

  async enterPrivateTeam(userUuid: string, teamUuid: string, password: string) {
    const isCorretPw = await this.isCorrectPrivateTeamPassword(
      teamUuid,
      password
    )

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
      .leftJoinAndSelect('team_user_profile.user_uuid', 'user')
      .where('team_uuid = :teamUuid', { teamUuid })
      .getMany()

    const combineUser: CombineUser[] = allUsers.map((user) => {
      return {
        ...user,
        team_profile:
          teamUserProfiles.find(
            (profile) => profile.user_uuid.uuid === user.uuid
          ) || null
      }
    })

    return combineUser
  }
}
