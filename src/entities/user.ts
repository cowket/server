import { ApiProperty } from '@nestjs/swagger'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn
} from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ description: '유저 아이디' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: '유저 유니크 아이디' })
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ApiProperty({ description: '이메일' })
  @Column('varchar', { length: 100 })
  email: string

  @Column('varchar', { length: 200 })
  password: string

  @Column()
  refresh_token: string

  @ApiProperty({ description: '아바타 URL' })
  @Column('varchar', { length: 500, default: null })
  avatar: string

  @ApiProperty({ description: '유저 생성일' })
  @CreateDateColumn()
  create_date: Date

  @ApiProperty({ description: '유저 업데이트일' })
  @UpdateDateColumn()
  update_date: Date
}
