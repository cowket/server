import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { Message } from 'src/entities/message'
import { UtilService } from 'src/util/util.service'
import { MessageService } from './message.service'

@ApiTags('Message Controller')
@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private utilService: UtilService
  ) {}

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
    // const user = this.utilService.getUserInfoFromReq(req)
    return await this.messageService.fetchMessageLatest(channelUuid)
  }
}
