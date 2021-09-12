import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Team } from 'src/entities/team'
import { Repository } from 'typeorm'

@Injectable()
export class TeamsService {
  constructor(@InjectRepository(Team) private teamRepository: Repository<Team>) {}

  async getAllTeamsByUser(uuid: string): Promise<Team[]> {
    const teams = await this.teamRepository.find({ where: { uuid } })
    return teams
  }
}
