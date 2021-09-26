import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RequestTeamData, Team, UpdateTeamData } from 'src/entities/team'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private teamRepository: Repository<Team>,
    private usersService: UsersService,
    private utilService: UtilService
  ) {}

  async deleteTeam(teamUuid: string, userUuid: string) {
    const team = await this.teamRepository
      .createQueryBuilder('team')
      .where({ owner: { uuid: userUuid }, uuid: teamUuid })
      .getOne()

    if (team) {
      await this.teamRepository.delete({ uuid: teamUuid })
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
    const { name, description, is_private } = createTeam

    const user = await this.usersService.findByUuid(userUuid)
    const team = await this.teamRepository.insert({
      create_date: new Date(),
      update_date: new Date(),
      name,
      owner: user,
      uuid: this.utilService.genUuid(),
      is_private,
      description
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
}
