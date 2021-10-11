import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { Team } from './team'
import { TeamUserProfile } from './team_user_profile'
import { User } from './user'

@Entity({ name: 'direct_message' })
export class DirectMessage {
  @ApiProperty({ description: '메세지 uuid' })
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team', referencedColumnName: 'uuid' })
  team: Team

  @ApiProperty({ description: '메세지 보낸 유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender', referencedColumnName: 'uuid' })
  sender: User

  @ApiProperty({ description: '팀 유저 프로필 (발신자)', nullable: true })
  @ManyToOne(() => TeamUserProfile)
  @JoinColumn({ name: 'sender_team_user_profile', referencedColumnName: 'id' })
  @Column({ nullable: true, default: null })
  sender_team_user_profile?: TeamUserProfile

  @ApiProperty({ description: '메세지 수신 유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver', referencedColumnName: 'uuid' })
  receiver: User

  @ApiProperty({ description: '팀 유저 프로필 (수신자)', nullable: true })
  @ManyToOne(() => TeamUserProfile)
  @JoinColumn({
    name: 'receiver_team_user_profile',
    referencedColumnName: 'id'
  })
  @Column({ nullable: true, default: null })
  receiver_team_user_profile?: TeamUserProfile

  @ApiProperty({ description: '편집 여부' })
  @Column('boolean', { default: false })
  is_updated: boolean

  @ApiProperty({ description: '메세지 생성일' })
  @CreateDateColumn()
  create_date: Date

  @ApiProperty({ description: '메세지 편집일' })
  @UpdateDateColumn()
  update_date: Date

  @ApiProperty({ description: '메세지 내용' })
  @Column('longtext', { nullable: false })
  content: string
}
