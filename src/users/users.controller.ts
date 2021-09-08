import { Controller, Get, HttpCode, HttpStatus, Logger, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation } from '@nestjs/swagger'
import { Response } from 'express'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController')

  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard('local'))
  @Get('all')
  @HttpCode(200)
  @ApiOperation({
    summary: '유저 리스트 (테스트용)'
  })
  async allUsers(@Res() res: Response) {
    this.logger.log('call')

    res.status(HttpStatus.OK).end()
  }
}
