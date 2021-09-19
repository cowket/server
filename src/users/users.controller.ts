import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
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
import { UpdateUser } from 'src/entities/user'
import { Users } from './users.decorator'
import { UsersService } from './users.service'

@ApiTags('User Controller')
@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController')

  constructor(private usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('all')
  @HttpCode(200)
  @ApiOperation({
    summary: '유저 리스트 (테스트용) - 가드 테스트'
  })
  async allUsers(@Req() req: Request, @Res() res: Response) {
    return res.status(HttpStatus.OK).json(req.user)
  }

  @UseGuards(JwtGuard)
  @Get('teams')
  @HttpCode(200)
  @ApiOperation({
    summary: '유저가 접근할 수 있는 팀 목록 조회'
  })
  async accessibleTeams(@Users() uuid: string, @Res() res: Response) {
    const grants = await this.usersService.findAccessibleTeams(uuid)

    return res.status(200).json(grants)
  }

  @UseGuards(JwtGuard)
  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '유저 정보 업데이트'
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateUser(@Body() user: UpdateUser, @Res() res: Response) {
    const findUser = await this.usersService.findByUuid(user.uuid)
    if (!findUser)
      throw new HttpException('존재하지 않는 유저', HttpStatus.BAD_REQUEST)
    const result = await this.usersService.updateUser(user)
    if (!result.affected)
      throw new HttpException('SQL 에러', HttpStatus.INTERNAL_SERVER_ERROR)
    const updatedUser = await this.usersService.findByUuid(user.uuid)
    return res.status(HttpStatus.OK).json(updatedUser)
  }
}
