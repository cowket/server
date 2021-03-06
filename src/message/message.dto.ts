import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsObject, IsOptional, IsString, Length, Max, Min } from 'class-validator'
import { Message } from 'src/entities/message'
import { Type } from 'class-transformer'

export class RequestDirectMessageDto {
  @ApiProperty({ description: '메세지 내용 (HTML)' })
  @IsString()
  content: string

  @ApiProperty({ description: '보내는 유저 uuid' })
  @IsString()
  sender_uuid: string

  @ApiProperty({ description: '받는 유저 uuid' })
  @IsString()
  receiver_uuid: string

  @ApiProperty({ description: '팀 uuid' })
  @IsString()
  team_uuid: string
}

export type SystemMessageType = 'enter' | 'public' | 'enter:private'
export type MessageType = 'user' | 'system' | 'anonymous'

export class GetMessageQuery {
  @IsString()
  @IsOptional()
  channel_uuid: string

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(10)
  @Max(100)
  count = 10

  @IsString()
  @IsOptional()
  message_type: 'message' | 'direct_message' = 'message'

  @IsString()
  @IsOptional()
  sender_uuid: string

  @IsString()
  @IsOptional()
  receiver_uuid: string

  @IsString()
  @IsOptional()
  team_uuid: string
}

/**
 * 메세지 전송시 타입 (서비스에서 사용 - 내부 타입)
 */
export class PushMessageDto {
  @IsString()
  team_uuid: string // 팀 uuid

  @IsString()
  channel_uuid: string // 채널 uuid

  @IsString()
  sender_uuid: string // 유저 uuid

  @IsString()
  @Length(2)
  content: string // 메세지 (HTML)
}

export class FetchMessageDto {
  latestMessage: Partial<Message>
}

/**
 * 소켓 이벤트 전송시 타입 (클라이언트에서 맞춰야하는 실제 타입)
 */
export class SocketPushMessageDto extends PushMessageDto {}

export class LoadMessageDto {
  @IsObject()
  topMessage: Message // 제일 맨 위에 있는 메세지
}

export class DeleteMessageDto {
  @IsString()
  message_uuid: string

  @IsString()
  channel_uuid: string
}

export class UpdateMessageDto {
  @IsString()
  message_uuid: string

  @IsString()
  content: string
}
