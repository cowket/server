import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  Index
} from 'typeorm'
import { User } from './user'

export class ExitTeamDto {
  @IsString()
  team_uuid: string
}

export class EnterTeamData {
  @ApiProperty({ description: '팀 유니크 아이디' })
  @IsString()
  team_uuid: string

  @ApiProperty({ description: '팀 비밀번호 (비공개 팀일시 필수)' })
  @IsString()
  @IsOptional()
  password?: string
}

export class RequestTeamData {
  @ApiProperty({ description: '팀 이름' })
  @IsString()
  name: string

  @ApiProperty({ description: '팀 비공개 여부' })
  @IsBoolean()
  is_private?: boolean

  @ApiProperty({ description: '팀 설명' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: '팀 비밀번호 (비공개 팀일시 필수)' })
  @IsString()
  @IsOptional()
  password?: string
}

export class UpdateTeamData extends RequestTeamData {
  @ApiProperty({ description: '팀 아바타 URL' })
  @IsOptional()
  avatar: string | null
}

@Entity({ name: 'team' })
export class Team {
  @ApiProperty({ description: '팀 유니크 아이디' })
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ManyToOne(() => User)
  @JoinColumn()
  @ApiProperty({ description: '팀 소유자' })
  owner: User

  @Index({ fulltext: true })
  @Column('varchar', { length: 200 })
  @ApiProperty({ description: '팀 이름' })
  name: string

  @Column('varchar', { length: 500, default: null })
  @ApiProperty({ description: '팀 아바타 URL' })
  avatar: string

  @CreateDateColumn()
  @ApiProperty({ description: '팀 생성일' })
  create_date: Date

  @UpdateDateColumn()
  @ApiProperty({ description: '팀 프로필 업데이트일' })
  update_date: Date

  @Column('boolean', { default: false })
  @ApiProperty({ description: '팀 공개 여부' })
  is_private: boolean

  @Index({ fulltext: true })
  @Column('varchar', { length: 500, nullable: true, default: null })
  @ApiProperty({ description: '팀 설명' })
  description: string

  @Column('varchar', { length: 500, nullable: true, select: false })
  @ApiProperty({ description: '비공개팀일시 팀 비밀번호' })
  password: string
}
