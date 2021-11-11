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
      .createQueryBuilder()
      .leftJoinAndSelect('user_grant.channel_uuid', 'channel')
      .leftJoinAndSelect('user_grant.team_uuid', 'team')
      .leftJoinAndSelect('user_grant.team_user_profile', 'tup')
      .where('user_grant.team.uuid = :teamUuid', { teamUuid })
      .getMany()
  }

  async updateAllTup(tupId: number, userUuid: string, teamUuid: string) {
    return (
      this.userGrantRepo
        .createQueryBuilder()
        // .update('SET user_grant.team_user_profile = :tupId', { tupId })
        .update()
        .set({ team_user_profile: tupId as unknown })
        .where('user_grant.user_uuid = :userUuid', { userUuid })
        .andWhere('user_grant.team_uuid = :teamUuid', { teamUuid })
        .execute()
    )
  }
}
