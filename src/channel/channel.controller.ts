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
  Query,
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
  DeleteChannelDto,
  GetAllPublicQuery,
  InvitePrivateChannelDto
} from 'src/entities/channel'
import { ChannelService } from './channel.service'
import { UserGrant } from 'src/entities/user_grant'
import { User } from 'src/users/users.decorator'
import { TokenUserInfo } from 'src/types/user'
import {
  NotOwnerError,
  NotPrivateChannelError,
  UniqueChannelError
} from 'src/error/error'

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
    try {
      const removed = await this.channelService.deleteChannel(channelDto)

      return !!removed
    } catch (error) {
      if (error instanceof UniqueChannelError) {
        throw new HttpException(
          '기본 채널은 삭제할 수 없습니다.',
          HttpStatus.BAD_REQUEST
        )
      }
      throw new HttpException(
        '삭제에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
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

  @Get('public')
  @ApiOperation({
    summary: '공개 채널 조회',
    description: '공개 채널을 조회합니다.'
  })
  @ApiOkResponse({
    type: [Channel]
  })
  @UsePipes(new ValidationPipe())
  async getAllPublicChannelCtrl(@Query() { team_uuid }: GetAllPublicQuery) {
    return await this.channelService.getAllPublicChannel(team_uuid)
  }

  @Post('invite')
  @ApiOperation({
    summary: '비공개 채널 참여자 추가',
    description:
      '비공개 채널에 참여자를 추가합니다. 채널의 소유자만 참여자를 추가할 수 있습니다.'
  })
  @ApiOkResponse({ type: Boolean })
  @UsePipes(new ValidationPipe())
  async invitePrivateChannelCtrl(
    @Body() { channel_uuid, user_uuids }: InvitePrivateChannelDto,
    @User() user: TokenUserInfo
  ) {
    try {
      await this.channelService.checkPrivateChannelInfo(user.uuid, channel_uuid)
      const isSuccess = await this.channelService.invitePrivateChannel(
        user_uuids,
        channel_uuid
      )
      return isSuccess
    } catch (error) {
      if (error instanceof NotOwnerError) {
        throw new HttpException(
          '채널의 소유자만 참여시킬 수 있습니다.',
          HttpStatus.FORBIDDEN
        )
      } else if (error instanceof NotPrivateChannelError) {
        throw new HttpException(
          '비공개 채널이 아닙니다.',
          HttpStatus.BAD_REQUEST
        )
      }
    }
  }

  // @Get('search')
  // @ApiOperation({
  //   summary: '공개 채널 검색',
  //   description:
  //     '공개 채널을 검색합니다. 비공개 채널은 검색 결과에 포함되지 않습니다.'
  // })
  // @ApiOkResponse({
  //   type: [Channel]
  // })
  // async searchPublicChannelCtrl(
  //   @Query('keyword', new LengthValidationPipe()) keyword: string,
  //   @Query('team_uuid') teamUuid: string
  // ) {}
}
