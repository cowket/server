import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
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

    return res.status(200).json(teams)
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
}
