import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private teamRepository: Repository<Team>,
    private usersService: UsersService,
    private utilService: UtilService
  ) {}

  async getAllTeamsByUser(uuid: string): Promise<Team[]> {
    const teams = await this.teamRepository
      .createQueryBuilder('teams')
      .leftJoinAndSelect('teams.owner', 'users')
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

    return team.generatedMaps
  }

  async isExistTeamName(teamName: string): Promise<boolean> {
    try {
      const isExistTeam = this.teamRepository.findOne({ where: { name: teamName } })
      return !!isExistTeam
    } catch (error) {
      return false
    }
  }
}
