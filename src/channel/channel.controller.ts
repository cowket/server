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
import { ChannelService } from './channel.service'
import { UserGrant } from 'src/entities/user_grant'
import { User } from 'src/users/users.decorator'
import { TokenUserInfo } from 'src/types/user'

@ApiTags('Channel Controller')
@Controller('channel')
@UseGuards(JwtGuard)
export class ChannelController {
  private _logger = new Logger('ChannelController')

  constructor(private channelService: ChannelService) {}

  @Post()
  @ApiOperation({ summary: '채널 생성', description: '채널을 생성합니다.' })
  @ApiBody({ type: CreateChannelDto })
  @ApiCreatedResponse({ type: Channel })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChannel(
    @Req() req: Request,
    @Body() channelDto: CreateChannelDto,
    @User() user: TokenUserInfo
  ) {
    const { uuid: userUuid } = user
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
    description: '채널의 내용을 수정합니다.'
  })
  @ApiBody({ type: UpdateChannelDto })
  @ApiOkResponse({ type: Channel })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateChannel(
    @Req() req: Request,
    @Body() channelDto: UpdateChannelDto,
    @User() user: TokenUserInfo
  ) {
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
    @Body() channelDto: DeleteChannelDto,
    @User() user: TokenUserInfo
  ) {
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
    summary: '팀 내 가입된 채널 조회',
    description: '팀 내 가입된 모든 채널을 조회합니다.'
  })
  @ApiOkResponse({ type: [UserGrant] })
  @ApiParam({ name: 'uuid', description: '팀 uuid' })
  async getAllChannel(
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @User() user: TokenUserInfo
  ) {
    const grantCheck = await this.channelService.grantCheck(user.uuid, uuid)

    if (!grantCheck)
      throw new HttpException('팀에 가입되지 않은 유저', HttpStatus.FORBIDDEN)

    return await this.channelService.grantAllChannel(user.uuid, uuid)
  }
}
