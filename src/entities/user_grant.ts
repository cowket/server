import { ApiProperty } from '@nestjs/swagger'
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
import { User } from './user'

@Entity({ name: 'user_grant' })
export class UserGrant {
  @ApiProperty({ description: 'Primary 아이디' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: '유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'user_uuid' })
  @Column('varchar')
  user_uuid: User

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'team_uuid' })
  @Column('varchar', { nullable: true })
  team_uuid: Team

  @ApiProperty({ description: '채널 정보' })
  @ManyToOne(() => Channel)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'channel_uuid' })
  @Column('varchar', { nullable: true })
  channel_uuid: Channel

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn({ nullable: false })
  create_date: Date
}
