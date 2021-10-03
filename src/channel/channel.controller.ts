import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import {
  CreateChannelDto,
  Channel,
  UpdateChannelDto,
  DeleteChannelDto
} from 'src/entities/channel'
import { UtilService } from 'src/util/util.service'

@ApiTags('Channel Controller')
@Controller('channel')
@UseGuards(JwtGuard)
export class ChannelController {
  private _logger = new Logger('ChannelController')

  constructor(private utilService: UtilService) {}

  @Post()
  @ApiOperation({ summary: '채널 생성', description: '채널을 생성합니다.' })
  @ApiBody({ type: CreateChannelDto })
  @ApiOkResponse({ type: Channel })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChannel(
    @Req() req: Request,
    @Body() channelDto: CreateChannelDto
  ) {
    const { uuid: userUuid } = this.utilService.getUserInfoFromReq(req)
  }

  @Put()
  @ApiOperation({
    summary: '채널 수정',
    description: '채널의 내용을 수정합니다. 현재는 이름만 가능'
  })
  @ApiBody({ type: UpdateChannelDto })
  @ApiOkResponse({ type: Channel })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateChannel(
    @Req() req: Request,
    @Body() channelDto: UpdateChannelDto
  ) {}

  @Delete()
  @ApiOperation({
    summary: '채널 삭제',
    description: '채널을 삭제합니다. 채널의 소유자만 삭제할 수 있습니다.'
  })
  @ApiBody({ type: DeleteChannelDto })
  @ApiOkResponse({ type: Boolean })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteChannel(
    @Req() req: Request,
    @Body() channelDto: DeleteChannelDto
  ) {}

  // @Get(':uuid')
  // @ApiOperation({
  //   summary: '채널 조회',
  //   description: '채널을 조회합니다.'
  // })
  // @ApiOkResponse({ type: Channel })
  // @ApiParam({ name: 'uuid', description: '' })
}
