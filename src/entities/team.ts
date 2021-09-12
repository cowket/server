import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'team' })
export class Team {
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid' })
  owner: User

  @Column('varchar', { length: 200 })
  name: string

  @Column('varchar', { length: 500 })
  avatar: string

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date
}
