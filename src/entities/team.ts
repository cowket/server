import { ApiProperty } from '@nestjs/swagger'
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
  @ApiProperty({ description: '팀 유니크 아이디' })
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ManyToOne(() => User)
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
