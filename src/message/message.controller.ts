import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { DirectMessage } from 'src/entities/direct_message'
import { Message } from 'src/entities/message'
import { TokenUserInfo } from 'src/types/user'
import { User } from 'src/users/users.decorator'
import { MessageService } from './message.service'

@ApiBearerAuth('access-token')
@ApiTags('Message Controller')
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({
    summary: '채널의 최근 메세지 10개를 조회',
    description:
      '채널의 최근 메세지를 10개 조회합니다. 채널 입장시 해당 API를 사용해서 메세지를 조회하면 됩니다.'
  })
  @ApiOkResponse({
    type: [Message]
  })
  async getMessageLatest(
    @Req() req: Request,
    @Query('channel_uuid') channelUuid: string
  ) {
    return await this.messageService.fetchMessageLatest(channelUuid)
  }

  @UseGuards(JwtGuard)
  @Get('dm')
  @ApiOperation({
    summary: '최근 다이렉트 메세지 10개를 조회',
    description: '유저와 유저 사이의 최근 다이렉트 메세지 10개를 조회합니다.'
  })
  @ApiOkResponse({
    type: [DirectMessage]
  })
  async getDirectMessageLatest(
    @Query('sender') sender: string,
    @Query('receiver') receiver: string,
    @Query('team_uuid') teamUuid: string,
    @User() user: TokenUserInfo
  ) {
    if (user.uuid !== sender && user.uuid !== receiver)
      throw new HttpException(
        '조회하려는 유저의 정보가 일치하지 않습니다.',
        HttpStatus.FORBIDDEN
      )

    return await this.messageService.fetchDirectMessageLatest(
      sender,
      receiver,
      teamUuid
    )
  }
}
