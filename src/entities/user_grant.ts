import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Channel } from './channel'
import { Team } from './team'
import { TeamUserProfile } from './team_user_profile'
import { User } from './user'

export class GetChannelMembersDto {
  @IsString()
  channel_uuid: string
}

@Entity({ name: 'user_grant' })
export class UserGrant {
  @ApiProperty({ description: 'Primary 아이디' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: '유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'user' })
  @Column('varchar', { nullable: false })
  user: User

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'team' })
  @Column('varchar', { nullable: false })
  team: Team

  @ApiProperty({ description: '채널 정보' })
  @ManyToOne(() => Channel)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'channel' })
  @Column('varchar', { nullable: true })
  channel: Channel

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({ nullable: false })
  create_date: Date

  @ApiProperty({ description: '팀 내 프로필' })
  @ManyToOne(() => TeamUserProfile)
  @JoinColumn({ name: 'team_user_profile', referencedColumnName: 'id' })
  team_user_profile: TeamUserProfile
}
