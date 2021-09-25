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
import { User } from './user'

@Entity({ name: 'channel' })
export class Channel {
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'owner_uuid' })
  owner: User

  @ManyToOne(() => Team)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'team_uuid' })
  team: Team

  @Column('varchar', { length: 100 })
  name: string

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date
}
