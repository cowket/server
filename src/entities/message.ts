import { ApiProperty } from '@nestjs/swagger'
import { MessageType } from 'src/message/message.dto'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { Channel } from './channel'
import { Reaction } from './reaction'
import { Team } from './team'
import { TeamUserProfile } from './team_user_profile'
import { User } from './user'

@Entity('message')
export class Message {
  @ApiProperty({ description: '메세지 uuid' })
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team', referencedColumnName: 'uuid' })
  team: Team

  @ApiProperty({ description: '채널 정보' })
  @ManyToOne(() => Channel, { nullable: true })
  @JoinColumn({ name: 'channel', referencedColumnName: 'uuid' })
  channel: Channel

  @ApiProperty({ description: '메세지 보낸 유저 정보' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sender', referencedColumnName: 'uuid' })
  sender: User

  @ApiProperty({ description: '팀 유저 프로필', nullable: true })
  @ManyToOne(() => TeamUserProfile, { nullable: true })
  @JoinColumn({ name: 'sender_team_user_profile', referencedColumnName: 'id' })
  sender_team_user_profile?: TeamUserProfile

  @ApiProperty({ description: '다이렉트 메세지일 경우 받는 유저' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiver', referencedColumnName: 'uuid' })
  receiver?: User

  @ApiProperty({ description: '팀 유저 프로필 (받는 유저)', nullable: true })
  @ManyToOne(() => TeamUserProfile, { nullable: true })
  @JoinColumn({
    name: 'receiver_team_user_profile',
    referencedColumnName: 'id'
  })
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

  @ApiProperty({ description: '메세지 타입 "user | system"', default: 'user' })
  @Column('varchar', { nullable: true, default: 'user' })
  type: MessageType

  @OneToMany(() => Reaction, (reaction) => reaction.message, {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'reactions' })
  reactions: Reaction[]
}
