import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/jwt.guard'
import { Message } from 'src/entities/message'
import { TokenUserInfo } from 'src/types/user'
import { User } from 'src/users/users.decorator'
import { GetDirectMessageQuery, GetMessageQuery } from './message.dto'
import { MessageService } from './message.service'

@UseGuards(JwtGuard)
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
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMessageLatest(@Query() query: GetMessageQuery) {
    const { channel_uuid: channelUuid, count } = query
    return await this.messageService.fetchMessageLatest(channelUuid, count)
  }

  @Get(':uuid')
  @ApiOkResponse({
    type: Message
  })
  async getMessage(@Param('uuid') uuid: string) {
    return this.messageService.getMessageByUuid(uuid)
  }

  @Get('dm')
  @ApiOperation({
    summary: '최근 다이렉트 메세지 10개를 조회',
    description: '유저와 유저 사이의 최근 다이렉트 메세지 10개를 조회합니다.'
  })
  @ApiOkResponse({
    type: [Message]
  })
  @UsePipes(new ValidationPipe())
  async getDirectMessageLatest(@Query() query: GetDirectMessageQuery, @User() user: TokenUserInfo) {
    const { sender, receiver, team_uuid: teamUuid } = query

    if (user.uuid !== sender && user.uuid !== receiver)
      throw new HttpException('조회하려는 유저의 정보가 일치하지 않습니다.', HttpStatus.FORBIDDEN)

    return await this.messageService.fetchDirectMessageLatest(sender, receiver, teamUuid)
  }
}
