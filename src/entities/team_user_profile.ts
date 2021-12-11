import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Team } from './team'
import { User } from './user'

export class RequestTeamUserProfile {
  @ApiProperty({ description: '표시될 이름' })
  @IsString()
  @Length(2, 20)
  name: string

  @ApiProperty({ description: '팀 내에서 맡고있는 일 혹은 직책/직급 등' })
  @IsString()
  @Length(2, 20)
  position: string

  @ApiProperty({ description: '아바타 URL' })
  @IsOptional()
  @IsString()
  avatar: string

  @ApiProperty({ description: '연락처' })
  @IsOptional()
  @IsString()
  @Length(10, 11)
  contact: string

  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string
}

@Entity({ name: 'team_user_profile' })
export class TeamUserProfile {
  @ApiProperty({ description: '팀 내 유저 프로필 아이디' })
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_uuid', referencedColumnName: 'uuid' })
  user_uuid: User

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_uuid', referencedColumnName: 'uuid' })
  team_uuid: Team

  @ApiProperty({ description: '표시될 이름' })
  @Column('varchar', { length: 50, nullable: true })
  name: string

  @ApiProperty({ description: '팀 내에서 맡고있는 일 혹은 직책/직급 등' })
  @Column('varchar', { length: 50, nullable: true })
  position: string

  @ApiProperty({ description: '아바타 URL' })
  @Column('varchar', { nullable: true })
  avatar: string

  @ApiProperty({ description: '연락처' })
  @Column('varchar', { length: 15, nullable: true })
  contact: string

  @ApiProperty({ description: '프로필 생성일' })
  @CreateDateColumn()
  create_date: Date
}

export class CombineUser extends User {
  @ApiProperty({ description: '팀 내 프로필', required: false })
  team_profile?: TeamUserProfile | null
}
