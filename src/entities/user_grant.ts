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
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'user_uuid' })
  @Column('varchar')
  user_uuid: User

  @ManyToOne(() => Team)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'team_uuid' })
  @Column('varchar', { nullable: true })
  team_uuid: Team

  @ManyToOne(() => Channel)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'channel_uuid' })
  @Column('varchar', { nullable: true })
  channel_uuid: Channel

  @CreateDateColumn({ nullable: false })
  create_date: Date
}
