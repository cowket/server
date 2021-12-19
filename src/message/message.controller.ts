import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/jwt.guard'
import { Message } from 'src/entities/message'
import { GetMessageQuery } from './message.dto'
import { MessageService } from './message.service'

// @UseGuards(JwtGuard)
@ApiBearerAuth('access-token')
@ApiTags('Message Controller')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  @ApiOperation({
    summary: '채널의 최근 메세지 조회',
    description:
      '채널의 최근 메세지를 조회합니다. 채널 입장시 해당 API를 사용해서 메세지를 조회하면 됩니다.'
  })
  @ApiOkResponse({
    type: [Message]
  })
  @ApiQuery({
    name: 'channel_uuid',
    required: false
  })
  @ApiQuery({
    name: 'count',
    required: false,
    description: '가져올 메세지 갯수를 지정합니다. 기본 값은 10입니다.'
  })
  @ApiQuery({
    name: 'message_type',
    required: false,
    description:
      '메세지 타입을 지정합니다. `message` 혹은 `direct_message`를 입력합니다. 기본 값은 `message` 입니다. `direct_message`인 경우 `sender_uuid`와 `receiver_uuid`가 입력되어야 합니다.'
  })
  @ApiQuery({
    name: 'sender_uuid',
    required: false,
    description: '`direct_message`인 경우 발신자 uuid'
  })
  @ApiQuery({
    name: 'receiver_uuid',
    required: false,
    description: '`direct_message`인 경우 수신자 uuid'
  })
  @ApiQuery({
    name: 'team_uuid',
    required: false,
    description: '`direct_message`인 경우 팀 uuid'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getMessageLatest(@Query() query: GetMessageQuery) {
    if (query.message_type === 'direct_message') {
      if (!query.receiver_uuid || !query.sender_uuid || !query.team_uuid)
        throw new BadRequestException(
          400,
          'direct_message 타입의 경우 sender_uuid, receiver_uuid, team_uuid가 필수입니다.'
        )
    }
    return this.messageService.fetchMessageLatest(query)
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Message
  })
  async getMessage(@Param('uuid') uuid: string) {
    return this.messageService.getMessageByUuid(uuid)
  }
}
