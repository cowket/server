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
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
import { CreateTeamData } from 'src/entities/team'
import { UtilService } from 'src/util/util.service'
import { TeamService } from './team.service'

@ApiTags('Team Controller')
@Controller('team')
export class TeamController {
  constructor(
    private teamService: TeamService,
    private utilService: UtilService
  ) {}

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
  @UsePipes(new ValidationPipe({ transform: true }))
  async newTeam(
    @Req() req: Request,
    @Body() createTeam: CreateTeamData,
    @Res() res: Response
  ) {
    if (!req.body || !createTeam || !createTeam.name)
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)

    const user = this.utilService.getUserInfoFromReq(req)
    const isExist = await this.teamService.isExistTeamName(createTeam.name)
    if (isExist) {
      throw new HttpException('존재하는 팀 이름', HttpStatus.BAD_REQUEST)
    }
    const team = await this.teamService.createTeam(
      createTeam.name,
      user.uuid,
      createTeam.is_private
    )

    return res.status(HttpStatus.OK).json(team)
  }

  @UseGuards(JwtGuard)
  @Delete(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '팀 삭제' })
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

  @UseGuards(JwtGuard)
  @Put(':uuid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '팀 업데이트 (작업중)'
  })
  async updateTeam(@Param('uuid') uuid: string, @Res() res: Response) {
    console.log(uuid)
    return res.status(200).end()
  }
}
