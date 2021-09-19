import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
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
    return this.teamRepository.findOne({
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

  async createTeam(teamName: string, userUuid: string) {
    const user = await this.usersService.findByUuid(userUuid)
    const team = await this.teamRepository.insert({
      avatar: '',
      create_date: new Date(),
      update_date: new Date(),
      name: teamName,
      owner: user,
      uuid: this.utilService.genUuid()
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
}
