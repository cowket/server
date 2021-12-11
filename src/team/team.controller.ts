import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/jwt.guard'
import { EnterTeamData, RequestTeamData, Team, UpdateTeamData } from 'src/entities/team'
import {
  CombineUser,
  RequestTeamUserProfile,
  TeamUserProfile
} from 'src/entities/team_user_profile'
import { User } from 'src/entities/user'
import { TokenUserInfo } from 'src/types/user'
import { UserService } from 'src/user/user.service'
import { TeamService } from './team.service'
import { User as UserDecorator } from 'src/user/user.decorator'

@ApiBearerAuth('access-token')
@ApiTags('Team Controller')
@Controller('team')
@UseGuards(JwtGuard)
export class TeamController {
  constructor(
    private teamService: TeamService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

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

  @Post('new')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 생성' })
  @ApiOkResponse({ description: '생성된 팀 정보', type: Team })
  @UsePipes(new ValidationPipe({ transform: true }))
  async newTeam(@Body() createTeam: RequestTeamData, @UserDecorator() user: TokenUserInfo) {
    if (createTeam.is_private && !createTeam.password)
      throw new BadRequestException(null, '비공개 팀일시 비밀번호는 필수입니다.')

    const isExist = await this.teamService.isExistTeamName(createTeam.name)
    if (isExist) {
      throw new BadRequestException(null, '존재하는 팀 이름')
    }
    const team = await this.teamService.createTeam(createTeam, user.uuid)
    await this.userService.setTeamGrant(user.uuid, team.uuid)

    return team
  }

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
      throw new BadRequestException(null, '검색 키워드가 없거나 2자 미만입니다.')

    const searchResult = await this.teamService.searchTeamByKeyword(keyword)

    return searchResult
  }

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
    if (!user_uuid || !team_uuid) throw new BadRequestException(null, '유저 uuid 혹은 팀 uuid 누락')

    const userProfile = await this.teamService.getTeamUserProfile(user_uuid, team_uuid)
    if (!userProfile) throw new BadRequestException(null, '존재하지 않는 유저')
    return userProfile
  }

  @Post('profile')
  @ApiOperation({
    summary: '팀 내 프로필 생성',
    description: '팀 내에 프로필을 생성합니다.'
  })
  @ApiOkResponse({ type: TeamUserProfile })
  @ApiBody({ type: RequestTeamUserProfile })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTeamUserProfile(
    @Body() profile: RequestTeamUserProfile,
    @UserDecorator() user: TokenUserInfo
  ) {
    return this.teamService.createTeamUserProfile(profile, user.uuid)
  }

  @Put('profile')
  @ApiOperation({
    summary: '팀 내 프로필 수정',
    description: '팀 내에 프로필을 수정합니다.'
  })
  @ApiOkResponse({ type: TeamUserProfile })
  @ApiBody({ type: RequestTeamUserProfile })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTeamUserProfile(
    @Body() profile: RequestTeamUserProfile,
    @UserDecorator() user: TokenUserInfo
  ) {
    return this.teamService.updateTeamUserProfile(profile, user.uuid)
  }

  @Post('enter')
  @ApiOperation({
    summary: '팀 가입',
    description:
      '팀에 가입합니다. 공개팀일 경우 바디에 team_uuid만 넣어주면 가입되며, 비공개팀일 경우 team_uuid와 password가 필요합니다.'
  })
  @ApiBody({ type: EnterTeamData })
  @ApiOkResponse({ type: 'boolean' })
  async enterTeam(@Body() body: EnterTeamData, @UserDecorator() user: TokenUserInfo) {
    const isPrivate = await this.teamService.getTeamPublicType(body.team_uuid)

    if (isPrivate) {
      if (!body.password) throw new ForbiddenException(null, '비공개팀은 비밀번호가 필수입니다')
      const correct = await this.teamService.enterPrivateTeam(
        user.uuid,
        body.team_uuid,
        body.password
      )
      if (correct) {
        // 유니크 채널 접근 권한 생성
        return true
      } else throw new BadRequestException(null, '비밀번호가 틀렸습니다.')
    } else {
      await this.teamService.enterPublicTeam(user.uuid, body.team_uuid)
      // 유니크 채널 접근 권한 생성
      return true
    }
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
  @ApiOkResponse({ type: Boolean })
  @ApiQuery({ name: 'uuid', required: true })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteTeam(@Param('uuid') uuid: string, @UserDecorator() user: TokenUserInfo) {
    const isSuccess = await this.teamService.deleteTeam(uuid, user.uuid)

    if (isSuccess) {
      return true
    } else {
      throw new BadRequestException(null, '팀이 존재하지 않거나 권한 없음')
    }
  }

  @Get(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 조회 (단건)',
    description: '단건 팀을 조회한다.'
  })
  @ApiOkResponse({ type: Team })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTeam(@Param('uuid') uuid: string) {
    const team = await this.teamService.getTeamByUuid(uuid)
    if (!team) throw new BadRequestException(null, '존재하지 않는 팀')
    return team
  }

  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 업데이트'
  })
  @ApiOkResponse({ type: Team })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTeam(
    @Param('uuid') uuid: string,
    @Body() body: UpdateTeamData,
    @UserDecorator() user: TokenUserInfo
  ) {
    // 존재 여부
    const isExistTeam = (await this.teamService.getCountTeam(uuid)) > 0
    if (!isExistTeam) throw new BadRequestException(null, '팀이 존재하지 않음')
    const isOwner = await this.teamService.isOwnerOfTeam(user.uuid, uuid)
    if (!isOwner) throw new ForbiddenException(null, '팀의 소유자만 정보를 변경할 수 있음')

    return this.teamService.updateTeam(uuid, body)
  }
}
