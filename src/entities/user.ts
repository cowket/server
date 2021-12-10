import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm'

export class UpdateUser {
  @ApiProperty({ description: '유저 아이디' })
  @IsNumber()
  id: number

  @ApiProperty({ description: '유저 uuid' })
  @IsString()
  uuid: string

  @ApiProperty({ description: '유저 이메일' })
  @IsString()
  email: string

  @ApiProperty({ description: '유저 아바타 URL', required: false })
  @IsOptional()
  avatar?: string
}

@Entity({ name: 'users' })
export class User {
  @ApiProperty({ description: '유저 유니크 아이디' })
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ApiProperty({ description: '이메일' })
  @Column('varchar', { length: 100 })
  email: string

  @Column('varchar', { length: 200, select: false })
  password: string

  @Column({ select: false, nullable: true, length: 1000 })
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

  @ApiProperty({ description: 'Socket ID' })
  @Column({ select: false, default: null })
  socket_id: string
}

export class SimpleUserInfo {
  @ApiProperty({ description: '이메일' })
  @IsString()
  email: string

  @ApiProperty({ description: '비밀번호' })
  @IsString()
  pw: string
}
