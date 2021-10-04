import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { Team } from './team'
import { User } from './user'

export class DeleteChannelDto {
  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string

  @ApiProperty({ description: '채널 uuid' })
  @IsString()
  channel_uuid: string
}

export class CreateChannelDto {
  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string

  @ApiProperty({ description: '채널 이름' })
  @IsString()
  @Length(2, 100)
  name: string

  @ApiProperty({ description: '채널 설명' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description: string
}

export class UpdateChannelDto {
  @ApiProperty({ description: '채널 uuid' })
  @IsString()
  channel_uuid: string

  @ApiProperty({ description: '채널 이름' })
  @IsString()
  @Length(2, 100)
  name: string

  @ApiProperty({ description: '채널 설명' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description: string
}

@Entity({ name: 'channel' })
export class Channel {
  @ApiProperty({ description: '채널 uuid' })
  @PrimaryColumn({ type: 'varchar' })
  uuid: string

  @ApiProperty({ description: '소유자 정보' })
  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'owner_uuid' })
  owner: User

  @ApiProperty({ description: '팀 정보' })
  @ManyToOne(() => Team)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'team_uuid' })
  team: Team

  @ApiProperty({ description: '채널 이름' })
  @Index({ fulltext: true })
  @Column('varchar', { length: 100 })
  name: string

  @ApiProperty({ description: '채널 생성일' })
  @CreateDateColumn()
  create_date: Date

  @ApiProperty({ description: '채널 업데이트 날짜 (프로필 등)' })
  @UpdateDateColumn()
  update_date: Date

  @ApiProperty({ description: '채널 설명' })
  @Index({ fulltext: true })
  @Column('varchar', { length: 500, nullable: true })
  description: string
}
