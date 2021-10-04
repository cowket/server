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
import { User } from './user'

/**
 * 메세지 전송시 타입 (서비스에서 사용 - 내부 타입)
 */
export class PushMessageDto {
  teamUuid: string // 팀 uuid
  channelUuid: string // 채널 uuid
  senderUuid: string // 유저 uuid
  content: string // 메세지 (HTML)
}

/**
 * 소켓 이벤트 전송시 타입 (클라이언트에서 맞춰야하는 실제 타입)
 */
export class SocketPushMessageDto extends PushMessageDto {}

@Entity('message')
export class Message {
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_uuid', referencedColumnName: 'uuid' })
  team: Team

  @ManyToOne(() => Channel)
  @JoinColumn({ name: 'channel_uuid', referencedColumnName: 'uuid' })
  channel: Channel

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_uuid', referencedColumnName: 'uuid' })
  sender: User

  @Column('boolean', { default: false })
  is_updated: boolean

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date

  @Column('longtext', { nullable: false })
  content: string
}
