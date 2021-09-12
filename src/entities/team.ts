import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column
} from 'typeorm'
import { User } from './user'

@Entity({ name: 'teams' })
export class Team {
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @OneToOne(() => User)
  @JoinColumn()
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
