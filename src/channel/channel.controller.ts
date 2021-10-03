import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
  ApiCreatedResponse,
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
import { ChannelService } from './channel.service'

@ApiTags('Channel Controller')
@Controller('channel')
@UseGuards(JwtGuard)
export class ChannelController {
  private _logger = new Logger('ChannelController')

  constructor(
    private utilService: UtilService,
    private channelService: ChannelService
  ) {}

  @Post()
  @ApiOperation({ summary: '채널 생성', description: '채널을 생성합니다.' })
  @ApiBody({ type: CreateChannelDto })
  @ApiCreatedResponse({ type: Channel })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChannel(
    @Req() req: Request,
    @Body() channelDto: CreateChannelDto
  ) {
    const { uuid: userUuid } = this.utilService.getUserInfoFromReq(req)
    const isDuplicate = await this.channelService.isDuplicatedName(
      channelDto.team_uuid,
      channelDto.name
    )
    if (isDuplicate)
      throw new HttpException(
        '중복된 채널 이름이 존재합니다.',
        HttpStatus.BAD_REQUEST
      )
    const createdChannel = await this.channelService.createChannel(
      userUuid,
      channelDto
    )

    return createdChannel
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
  ) {
    const user = this.utilService.getUserInfoFromReq(req)
    const isOwner = await this.channelService.isChannelOwner(
      user.uuid,
      channelDto.channel_uuid
    )

    if (isOwner === false)
      throw new HttpException('채널의 소유자가 아닙니다.', HttpStatus.FORBIDDEN)
    else if (isOwner === null)
      throw new HttpException(
        '채널이 존재하지 않습니다.',
        HttpStatus.BAD_REQUEST
      )

    return await this.channelService.updateChannel(channelDto)
  }

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
  ) {
    const user = this.utilService.getUserInfoFromReq(req)
    const isOwner = await this.channelService.isChannelOwner(
      user.uuid,
      channelDto.channel_uuid
    )

    if (isOwner === false)
      throw new HttpException('채널의 소유자가 아닙니다.', HttpStatus.FORBIDDEN)
    else if (isOwner === null)
      throw new HttpException(
        '채널이 존재하지 않습니다.',
        HttpStatus.BAD_REQUEST
      )

    const removed = await this.channelService.deleteChannel(channelDto)

    return !!removed
  }

  @Get('all/:uuid')
  @ApiOperation({
    summary: '팀 내 채널 조회',
    description: '팀 내 모든 채널을 조회합니다.'
  })
  @ApiOkResponse({ type: [Channel] })
  @ApiParam({ name: 'uuid', description: '팀 uuid' })
  async getAllChannel(@Param('uuid') uuid: string) {
    console.log(uuid)
  }

  @Get(':uuid')
  @ApiOperation({
    summary: '채널 조회',
    description: '채널을 조회합니다.'
  })
  @ApiOkResponse({ type: Channel })
  @ApiParam({ name: 'uuid', description: '채널 uuid' })
  async getChannel(@Param('uuid') uuid: string) {}
}
