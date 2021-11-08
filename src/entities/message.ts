import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsString, Length } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { Channel } from './channel'
import { Team } from './team'
import { TeamUserProfile } from './team_user_profile'
import { User } from './user'

export type SystemMessageType = 'enter' | 'public' | 'enter:private'
export type MessageType = 'user' | 'system'

export class GetMessageQuery {
  @IsString()
  channel_uuid: string
}

export class GetDirectMessageQuery {
  @IsString()
  sender: string

  @IsString()
  receiver: string

  @IsString()
  team_uuid: string
}

/**
 * 메세지 전송시 타입 (서비스에서 사용 - 내부 타입)
 */
export class PushMessageDto {
  @IsString()
  team_uuid: string // 팀 uuid

  @IsString()
  channel_uuid: string // 채널 uuid

  @IsString()
  sender_uuid: string // 유저 uuid

  @IsString()
  @Length(2)
  content: string // 메세지 (HTML)
}

export class FetchMessageDto {
  latestMessage: Partial<Message>
}

/**
 * 소켓 이벤트 전송시 타입 (클라이언트에서 맞춰야하는 실제 타입)
 */
export class SocketPushMessageDto extends PushMessageDto {}

@Entity('message')
export class Message {
  @ApiProperty({ description: '메세지 uuid' })
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_uuid', referencedColumnName: 'uuid' })
  team: Team

  @ApiProperty({ description: '채널 정보' })
  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channel_uuid', referencedColumnName: 'uuid' })
  channel: Channel

  @ApiProperty({ description: '메세지 보낸 유저 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_uuid', referencedColumnName: 'uuid' })
  sender: User

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

  @ApiProperty({ description: '팀 유저 프로필', nullable: true })
  @ManyToOne(() => TeamUserProfile)
  @JoinColumn({ name: 'team_user_profile', referencedColumnName: 'id' })
  @Column({ nullable: true, default: null })
  team_user_profile?: TeamUserProfile

  @ApiProperty({ description: '메세지 타입 "user | system"', default: 'user' })
  @Column('varchar', { nullable: true, default: 'user' })
  type: MessageType
}

export class LoadMessageDto {
  @IsObject()
  topMessage: Message // 제일 맨 위에 있는 메세지
}
