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

  async getGrantUserInTeam(teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .leftJoinAndSelect('grant.user_uuid', 'user')
      .leftJoinAndSelect('grant.team_user_profile', 'tup')
      .where('grant.team_uuid = :teamUuid', { teamUuid })
      .andWhere('grant.channel_uuid IS NULL')
      .getMany()
  }

  async createGrantTeam(userUuid: string, teamUuid: string) {
    return this.userGrantRepo.save({
      channel_uuid: null,
      team_uuid: { uuid: teamUuid },
      user_uuid: { uuid: userUuid }
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
      .where('user_grant.user_uuid = :userUuid', { userUuid })
      .andWhere('user_grant.team_uuid = :teamUuid', { teamUuid })
      .execute()
  }

  // 팀을 떠났을 때
  async removeGrant(userUuid: string, teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.user_uuid = :userUuid', { userUuid })
      .andWhere('grant.team_uuid = :teamUuid', { teamUuid })
      .execute()
  }

  // 소유자가 팀을 삭제
  async removeGrantAllUserInTeam(teamUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.team_uuid = :teamUuid', { teamUuid })
      .execute()
  }

  // 채널을 떠났을 때
  async removeGrantChannel(userUuid: string, teamUuid: string, channelUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.user_uuid = :userUuid', { userUuid })
      .andWhere('grant.team_uuid = :teamUuid', { teamUuid })
      .andWhere('grant.channel_uuid IS NOT NULL AND grant.channel_uuid = :channelUuid', {
        channelUuid
      })
      .execute()
  }

  // 소유자가 채널을 삭제
  async removeGrantAllUserInChannel(teamUuid: string, channelUuid: string) {
    return this.userGrantRepo
      .createQueryBuilder('grant')
      .delete()
      .where('grant.team_uuid = :teamUuid', { teamUuid })
      .andWhere('grant.channel_uuid IS NOT NULL AND grant.channel_uuid = :channelUuid', {
        channelUuid
      })
      .execute()
  }
}
