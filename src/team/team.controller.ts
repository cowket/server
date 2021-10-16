import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import {
  EnterTeamData,
  RequestTeamData,
  Team,
  UpdateTeamData
} from 'src/entities/team'
import {
  CombineUser,
  RequestTeamUserProfile,
  TeamUserProfile
} from 'src/entities/team_user_profile'
import { User } from 'src/entities/user'
import { TokenUserInfo } from 'src/types/user'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { TeamService } from './team.service'
import { User as UserDecorator } from 'src/users/users.decorator'

@ApiTags('Team Controller')
@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private utilService: UtilService,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService
  ) {}

  @UseGuards(JwtGuard)
  @Get()
  @ApiOperation({
    summary: '모든 팀 조회',
    description: '존재하는 모든 팀을 조회합니다.'
  })
  @ApiOkResponse({ type: [Team] })
  async getAllTeam() {
    const teams = await this.teamService.getAllTeam()
    return teams
  }

  @UseGuards(JwtGuard)
  @Post('new')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 생성' })
  @ApiOkResponse({ description: '생성된 팀 정보', type: Team })
  @UsePipes(new ValidationPipe({ transform: true }))
  async newTeam(
    @Req() req: Request,
    @Body() createTeam: RequestTeamData,
    @Res() res: Response,
    @UserDecorator() user: TokenUserInfo
  ) {
    if (!req.body || !createTeam || !createTeam.name)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    if (createTeam.is_private && !createTeam.password)
      throw new HttpException(
        '비공개 팀일시 비밀번호는 필수입니다.',
        HttpStatus.BAD_REQUEST
      )

    const isExist = await this.teamService.isExistTeamName(createTeam.name)
    if (isExist) {
      throw new HttpException('존재하는 팀 이름', HttpStatus.BAD_REQUEST)
    }
    const team = await this.teamService.createTeam(createTeam, user.uuid)
    await this.userService.setTeamGrant(user.uuid, team.uuid)

    return res.status(HttpStatus.OK).json(team)
  }

  @UseGuards(JwtGuard)
  @Get('search/:keyword')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 검색',
    description: '키워드로 팀을 검색합니다. 키워드는 2자 이상이어야 합니다.'
  })
  @ApiParam({
    name: 'keyword',
    description: '검색할 키워드, 팀 이름 및 설명으로 검색합니다.'
  })
  @ApiOkResponse({ type: [Team] })
  @ApiBadRequestResponse({ type: HttpException })
  async searchTeam(@Param('keyword') keyword: string) {
    if (!keyword || keyword.length < 2)
      throw new HttpException(
        '검색 키워드가 없거나 2자 미만입니다.',
        HttpStatus.BAD_REQUEST
      )

    const searchResult = await this.teamService.searchTeamByKeyword(keyword)

    return searchResult
  }

  @UseGuards(JwtGuard)
  @Get('grant/all/:uuid')
  @ApiOperation({
    summary: '팀 내에 참여중인 모든 유저 조회',
    description: '팀 내에 가입된 모든 유저의 정보를 반환합니다.'
  })
  @ApiParam({
    name: 'uuid',
    description: '팀 uuid'
  })
  @ApiOkResponse({ type: [CombineUser] })
  async getAllUserGrantInTeam(@Param('uuid') uuid: string) {
    const uuids = await this.teamService.getGrantsUserInTeam(uuid)
    const users = await this.teamService.getAllUserProfile(uuid, uuids)
    return users
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  @ApiOperation({
    summary: '팀 내에 유저 프로필 조회',
    description:
      '팀 내에 유저 uuid로 유저의 프로필을 조회합니다. 해당 유저가 팀 내에 프로필을 생성하지 않았을 경우 유저 테이블에 있는 내용을 반환합니다. 조회에는 팀 uuid와 유저 uuid가 필요합니다.'
  })
  @ApiOkResponse({ type: TeamUserProfile || User })
  @ApiBadRequestResponse({
    type: HttpException,
    description: '존재하지 않는 유저 등'
  })
  @ApiQuery({ name: 'user_uuid', required: true })
  @ApiQuery({ name: 'team_uuid', required: true })
  async getUserProfile(
    @Query('user_uuid') user_uuid: string,
    @Query('team_uuid') team_uuid: string
  ) {
    if (!user_uuid || !team_uuid)
      throw new HttpException(
        '유저 uuid 혹은 팀 uuid 누락',
        HttpStatus.BAD_REQUEST
      )

    const userProfile = await this.teamService.getTeamUserProfile(
      user_uuid,
      team_uuid
    )
    if (!userProfile)
      throw new HttpException('존재하지 않는 유저', HttpStatus.BAD_REQUEST)
    return userProfile
  }

  @UseGuards(JwtGuard)
  @Post('profile')
  @ApiOperation({
    summary: '팀 내 프로필 생성',
    description: '팀 내에 프로필을 생성합니다.'
  })
  @ApiOkResponse({ type: TeamUserProfile })
  @ApiBody({ type: RequestTeamUserProfile })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTeamUserProfile(
    @Req() req: Request,
    @Body() profile: RequestTeamUserProfile,
    @UserDecorator() user: TokenUserInfo
  ) {
    const insertedProfile = await this.teamService.createTeamUserProfile(
      profile,
      user.uuid
    )
    return insertedProfile
  }

  @UseGuards(JwtGuard)
  @Put('profile')
  @ApiOperation({
    summary: '팀 내 프로필 수정',
    description: '팀 내에 프로필을 수정합니다.'
  })
  @ApiOkResponse({ type: TeamUserProfile })
  @ApiBody({ type: RequestTeamUserProfile })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTeamUserProfile(
    @Req() req: Request,
    @Body() profile: RequestTeamUserProfile,
    @UserDecorator() user: TokenUserInfo
  ) {
    const updatedProfile = await this.teamService.updateTeamUserProfile(
      profile,
      user.uuid
    )

    return updatedProfile
  }

  @UseGuards(JwtGuard)
  @Post('enter')
  @ApiOperation({
    summary: '팀 가입',
    description:
      '팀에 가입합니다. 공개팀일 경우 바디에 team_uuid만 넣어주면 가입되며, 비공개팀일 경우 team_uuid와 password가 필요합니다.'
  })
  @ApiBody({ type: EnterTeamData })
  @ApiOkResponse({ type: 'boolean' })
  async enterTeam(
    @Body() body: EnterTeamData,
    @Req() req: Request,
    @UserDecorator() user: TokenUserInfo
  ) {
    const isPrivate = await this.teamService.getTeamPublicType(body.team_uuid)

    if (isPrivate) {
      if (!body.password)
        throw new HttpException(
          '비공개팀은 비밀번호가 필수입니다.',
          HttpStatus.FORBIDDEN
        )
      const correct = await this.teamService.enterPrivateTeam(
        user.uuid,
        body.team_uuid,
        body.password
      )
      if (correct) {
        // 유니크 채널 접근 권한 생성
        return true
      } else
        throw new HttpException(
          '비밀번호가 틀렸습니다.',
          HttpStatus.BAD_REQUEST
        )
    } else {
      await this.teamService.enterPublicTeam(user.uuid, body.team_uuid)
      // 유니크 채널 접근 권한 생성
      return true
    }
  }
  // TODO 팀 가입시 이미 가입되어있는 유저 체크 필요

  @UseGuards(JwtGuard)
  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
  @ApiOkResponse({ type: Boolean })
  async deleteTeam(
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @UserDecorator() user: TokenUserInfo
  ) {
    if (!uuid || !user)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const isSuccess = await this.teamService.deleteTeam(uuid, user.uuid)

    if (isSuccess) {
      return res.status(HttpStatus.OK).send(true)
    } else {
      throw new HttpException(
        '팀이 존재하지 않거나 권한 없음',
        HttpStatus.BAD_REQUEST
      )
    }
  }

  @UseGuards(JwtGuard)
  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 조회 (단건)',
    description: '단건 팀을 조회한다.'
  })
  @ApiOkResponse({ type: Team })
  async getTeam(@Param('uuid') uuid: string, @Res() res: Response) {
    if (!uuid) throw new HttpException('uuid Required', HttpStatus.BAD_REQUEST)

    const team = await this.teamService.getTeamByUuid(uuid)
    return res.status(HttpStatus.OK).json(team)
  }

  @UseGuards(JwtGuard)
  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 업데이트'
  })
  @ApiOkResponse({ type: Team })
  async updateTeam(
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @Body() body: UpdateTeamData,
    @Res() res: Response,
    @UserDecorator() user: TokenUserInfo
  ) {
    // 바디
    if (body.is_private === undefined || !body.name || !uuid)
      throw new HttpException('필수값 누락', HttpStatus.BAD_REQUEST)
    // 존재 여부
    const isExistTeam = (await this.teamService.getCountTeam(uuid)) > 0
    if (!isExistTeam)
      throw new HttpException('팀이 존재하지 않음', HttpStatus.BAD_REQUEST)
    const isOwner = await this.teamService.isOwnerOfTeam(user.uuid, uuid)
    if (!isOwner)
      throw new HttpException(
        '팀의 소유자만 정보를 변경할 수 있음',
        HttpStatus.FORBIDDEN
      )

    const updatedTeam = await this.teamService.updateTeam(uuid, body)

    return res.status(HttpStatus.OK).json(updatedTeam)
  }
}
