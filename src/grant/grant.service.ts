import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserGrant } from 'src/entities/user_grant'
import { Repository } from 'typeorm'

@Injectable()
export class GrantService {
  constructor(
    @InjectRepository(UserGrant)
    private readonly userGrantRepo: Repository<UserGrant>
  ) {}

  async getGrantChannel(teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('ug')
      .leftJoinAndSelect('ug.channel_uuid', 'channel')
      .leftJoinAndSelect('ug.team_uuid', 'team')
      .leftJoinAndSelect('ug.team_user_profile', 'tup')
      .where('team.uuid = :teamUuid', { teamUuid })
      .getMany()
  }

  async updateAllTup(tupId: number, userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('ug')
      .update('SET ug.team_user_profile = :tupId', { tupId })
      .where('ug.user_uuid = :userUuid', { userUuid })
      .andWhere('ug.team_uuid = :teamUuid', { teamUuid })
      .execute()
  }
}
