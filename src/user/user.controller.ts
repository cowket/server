import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { AuthService } from 'src/auth/auth.service'
import { JwtGuard } from 'src/auth/jwt.guard'
import { Team } from 'src/entities/team'
import { UpdateUser, User } from 'src/entities/user'
import { UserGrant } from 'src/entities/user_grant'
import { TeamService } from 'src/team/team.service'
import { Users } from './user.decorator'
import { UserService } from './user.service'
import { User as UserDecorator } from 'src/user/user.decorator'
import { TokenUserInfo } from 'src/types/user'

@ApiBearerAuth('access-token')
@ApiTags('User Controller')
@Controller('user')
export class UserController {
  private logger = new Logger('UserController')

  constructor(
    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService,
    private userSerivce: UserService,
    private authService: AuthService
  ) {}

  @UseGuards(JwtGuard)
  @Get('team')
  @ApiOperation({ summary: '유저가 소유자인 모든 팀 조회' })
  @ApiOkResponse({ type: [Team] })
  async getAllTeams(@Res() res: Response, @UserDecorator() user: TokenUserInfo) {
    const teams = await this.teamService.getAllTeamsByUser(user.uuid)

    return res.status(HttpStatus.OK).json(teams)
  }

  @UseGuards(JwtGuard)
  @Get('grant/team')
  @HttpCode(200)
  @ApiOperation({
    summary: '유저가 접근 가능한 팀 조회'
  })
  @ApiOkResponse({ type: [UserGrant] })
  async accessibleTeams(@Users() uuid: string, @Res() res: Response) {
    const grants = await this.userSerivce.findAccessibleTeams(uuid)

    return res.status(200).json(grants)
  }

  @UseGuards(JwtGuard)
  @Get('grant/channel/:uuid')
  @HttpCode(200)
  @ApiOperation({
    summary: '유저가 접근 가능한 팀 채널 조회',
    deprecated: true
  })
  @ApiOkResponse({ type: [UserGrant] })
  async accessibleChannels(
    @Users() uuid: string,
    @Param('uuid') teamUuid: string,
    @Res() res: Response
  ) {
    const grants = await this.userSerivce.findAccessibleChannels(uuid, teamUuid)

    return res.status(200).json(grants)
  }

  @UseGuards(JwtGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유저 정보 업데이트'
  })
  @ApiOkResponse({ type: User })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(@Body() user: UpdateUser, @Res() res: Response) {
    const findUser = await this.userSerivce.findByUuid(user.uuid)
    if (!findUser) throw new HttpException('존재하지 않는 유저', HttpStatus.BAD_REQUEST)
    const result = await this.userSerivce.updateUser(user)
    if (!result.affected) throw new HttpException('SQL 에러', HttpStatus.INTERNAL_SERVER_ERROR)
    const updatedUser = await this.userSerivce.findByUuid(user.uuid)
    const token = await this.authService.genAccessToken({
      ...updatedUser
    })
    res.setHeader('Authorization', token)
    return res.status(HttpStatus.OK).json(updatedUser)
  }
}
