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

@Entity('message', { synchronize: true })
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
}
