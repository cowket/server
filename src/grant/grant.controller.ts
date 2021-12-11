import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/jwt.guard'
import { UserGrant } from 'src/entities/user_grant'
import { RequiredValuePipe } from 'src/pipes/required.pipe'
import { GrantService } from './grant.service'

@ApiBearerAuth('access-token')
@ApiTags('Grant Controller')
@Controller('grant')
@UseGuards(JwtGuard)
export class GrantController {
  constructor(private grantService: GrantService) {}

  @Get('channel')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiQuery({ name: 'team_uuid', description: '조회하려는 채널의 팀 uuid' })
  @ApiOperation({
    summary: '채널 리스트 조회 (접근 가능한)',
    description: '접근 가능한 채널 리스트를 조회합니다.'
  })
  @ApiOkResponse({ type: [UserGrant] })
  async getAllGrantChannelCtrl(@Query('team_uuid', new RequiredValuePipe()) team_uuid: string) {
    return this.grantService.getGrantChannel(team_uuid)
  }
}
