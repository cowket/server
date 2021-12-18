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
      .leftJoinAndSelect('user_grant.channel', 'channel')
      .leftJoinAndSelect('user_grant.team', 'team')
      .leftJoinAndSelect('user_grant.team_user_profile', 'tup')
      .where('user_grant.team.uuid = :teamUuid', { teamUuid })
      .getMany()
  }

  async getGrantUserInTeam(teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .leftJoinAndSelect('grant.user', 'user')
      .leftJoinAndSelect('grant.team_user_profile', 'tup')
      .where('grant.team = :teamUuid', { teamUuid })
      .andWhere('grant.channel IS NULL')
      .getMany()
  }

  async createGrantTeam(userUuid: string, teamUuid: string) {
    return this.userGrantRepo.save({
      channel: null,
      team: { uuid: teamUuid },
      user: { uuid: userUuid }
    })
  }

  async updateAllTup(tupId: number, userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder()
      .update()
      .set({
        team_user_profile: {
          id: tupId
        }
      })
      .where('user_grant.user = :userUuid', { userUuid })
      .andWhere('user_grant.team = :teamUuid', { teamUuid })
      .execute()
  }

  // 팀을 떠났을 때
  async removeGrant(userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.user = :userUuid', { userUuid })
      .andWhere('grant.team = :teamUuid', { teamUuid })
      .execute()
  }

  // 소유자가 팀을 삭제
  async removeGrantAllUserInTeam(teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .leftJoin('grant.team', 'team')
      .delete()
      .where('team.uuid = :teamUuid', { teamUuid })
      .execute()
  }

  // 채널을 떠났을 때
  async removeGrantChannel(userUuid: string, teamUuid: string, channelUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.user = :userUuid', { userUuid })
      .andWhere('grant.team = :teamUuid', { teamUuid })
      .andWhere('grant.channel IS NOT NULL AND grant.channel = :channelUuid', {
        channelUuid
      })
      .execute()
  }

  // 소유자가 채널을 삭제
  async removeGrantAllUserInChannel(teamUuid: string, channelUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.team = :teamUuid', { teamUuid })
      .andWhere('grant.channel IS NOT NULL AND grant.channel = :channelUuid', {
        channelUuid
      })
      .execute()
  }
}
