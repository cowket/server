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
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { CreateTeamData } from 'src/types/team'
import { UtilService } from 'src/util/util.service'
import { TeamService } from './team.service'

@ApiTags('Team Controller')
@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService, private utilService: UtilService) {}

  @UseGuards(JwtGuard)
  @Get('all')
  @ApiOperation({ summary: '유저의 모든 팀 조회' })
  async getAllTeams(@Req() req: Request, @Res() res: Response) {
    const user = this.utilService.getUserInfoFromReq(req)
    const teams = await this.teamService.getAllTeamsByUser(user.uuid)

    return res.status(HttpStatus.OK).json(teams)
  }

  @UseGuards(JwtGuard)
  @Post('new')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 생성' })
  async newTeam(@Req() req: Request, @Body() createTeam: CreateTeamData, @Res() res: Response) {
    if (!req.body || !createTeam || !createTeam.name)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const user = this.utilService.getUserInfoFromReq(req)
    const team = await this.teamService.createTeam(createTeam.name, user.uuid)

    return res.status(HttpStatus.OK).json(team)
  }

  @UseGuards(JwtGuard)
  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
  async deleteTeam(@Req() req: Request, @Param('uuid') uuid: string, @Res() res: Response) {
    const user = this.utilService.getUserInfoFromReq(req)

    if (!uuid || !user) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const isSuccess = await this.teamService.deleteTeam(uuid, user.uuid)

    if (isSuccess) {
      return res.status(HttpStatus.OK).end()
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
  async getTeam(@Param('uuid') uuid: string, @Res() res: Response) {
    if (!uuid) throw new HttpException('uuid Required', HttpStatus.BAD_REQUEST)

    const team = await this.teamService.getTeamByUuid(uuid)
    return res.status(HttpStatus.OK).json(team)
  }
}
