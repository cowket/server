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
  @JoinColumn()
  team_uuid: string

  @ManyToOne(() => Channel)
  @JoinColumn()
  channel_uuid: string

  @ManyToOne(() => User)
  @JoinColumn()
  sender: string

  @Column('boolean', { default: false })
  is_updated: boolean

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date
}
