import { IsString } from 'class-validator'

// 메세지에 반응을 누를 때 필요한 값
export class CreateReactionDto {
  @IsString()
  message_uuid: string

  @IsString()
  team_uuid: string

  @IsString()
  channel_uuid: string

  @IsString()
  reaction: string
}
