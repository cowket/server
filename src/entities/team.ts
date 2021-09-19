import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
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

export class CreateTeamData {
  @ApiProperty({ description: '팀 이름' })
  @IsString()
  name: string

  @ApiProperty({ description: '팀 비공개 여부' })
  @IsBoolean()
  is_private?: boolean
}

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

  @Column('varchar', { length: 500, default: null })
  avatar: string

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date

  @Column('boolean', { default: false })
  is_private: boolean
}
