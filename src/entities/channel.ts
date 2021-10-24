import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator'
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

export class EnterPublicChannelDto {
  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string

  @ApiProperty({ description: '채널 uuid' })
  @IsString()
  channel_uuid: string
}

export class InvitableUserQuery {
  @ApiProperty({ description: '채널 uuid' })
  @IsString()
  channel_uuid: string

  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string
}

export class InvitePrivateChannelDto {
  @ApiProperty({ description: '추가 시키려는 참여자의 uuid 리스트' })
  @IsString({ each: true })
  user_uuids: string[]

  @ApiProperty({ description: '채널 uuid' })
  @IsString()
  channel_uuid: string

  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string
}

export class GetAllPublicQuery {
  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string
}

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

  @ApiProperty({
    description:
      '비공개 채널/공개 채널 여부 - 비공개 채널의 경우 채널의 소유자가 멤버를 가입시켜야 참여 가능'
  })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean
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

  @ApiProperty({
    description:
      '비공개 채널/공개 채널 여부 - 비공개 채널의 경우 채널의 소유자가 멤버를 가입시켜야 참여 가능'
  })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean
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

  @ApiProperty({
    description:
      '기본적으로 생성되는 공개 채널 여부 (해당 채널은 반드시 존재해야 함)'
  })
  @Column('boolean', { nullable: true, default: false })
  unique: boolean

  @ApiProperty({
    description:
      '비공개 채널/공개 채널 여부 - 비공개 채널의 경우 채널의 소유자가 멤버를 가입시켜야 참여 가능'
  })
  @Column('boolean', { nullable: true, default: false })
  is_private: boolean
}
