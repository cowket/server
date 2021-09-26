import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { RequestTeamData, Team, UpdateTeamData } from 'src/entities/team'
import { UsersService } from 'src/users/users.service'
import { UtilService } from 'src/util/util.service'
import { TeamService } from './team.service'

@ApiTags('Team Controller')
@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private utilService: UtilService,
    private userService: UsersService
  ) {}

  @UseGuards(JwtGuard)
  @Get('all')
  @ApiOperation({ summary: '유저의 모든 팀 조회' })
  @ApiOkResponse({ type: [Team] })
  async getAllTeams(@Req() req: Request, @Res() res: Response) {
    const user = this.utilService.getUserInfoFromReq(req)
    const teams = await this.teamService.getAllTeamsByUser(user.uuid)

    return res.status(HttpStatus.OK).json(teams)
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
    @Res() res: Response
  ) {
    if (!req.body || !createTeam || !createTeam.name)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const user = this.utilService.getUserInfoFromReq(req)
    const isExist = await this.teamService.isExistTeamName(createTeam.name)
    if (isExist) {
      throw new HttpException('존재하는 팀 이름', HttpStatus.BAD_REQUEST)
    }
    const team = await this.teamService.createTeam(createTeam, user.uuid)
    await this.userService.setTeamGrant(user.uuid, team.uuid)

    return res.status(HttpStatus.OK).json(team)
  }

  @UseGuards(JwtGuard)
  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
  @ApiOkResponse({ type: Boolean })
  async deleteTeam(
    @Req() req: Request,
    @Param('uuid') uuid: string,
    @Res() res: Response
  ) {
    const user = this.utilService.getUserInfoFromReq(req)

    if (!uuid || !user)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const isSuccess = await this.teamService.deleteTeam(uuid, user.uuid)

    if (isSuccess) {
      return res.status(HttpStatus.OK).send(true)
    } else {
      throw new HttpException('권한 없음', HttpStatus.FORBIDDEN)
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
    @Res() res: Response
  ) {
    const user = this.utilService.getUserInfoFromReq(req)
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
}
