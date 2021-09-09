import { Controller, Get, HttpCode, HttpStatus, Logger, Req, Res, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { JwtGuard } from 'src/auth/jwt.guard'
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
}
