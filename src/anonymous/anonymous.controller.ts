import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { CreateWorkspaceDto } from './anonymous.dto'
import { AnonymousService } from './anonymous.service'

@ApiTags('Anonymous Controller')
@Controller('anonymous')
export class AnonymousController {
  constructor(private anonService: AnonymousService) {}

  // 워크스페이스 생성
  @Post('workspace')
  @UsePipes(new ValidationPipe({ transform: true }))
  createWorkspace(@Body() createWorkSpaceDto: CreateWorkspaceDto) {
    return createWorkSpaceDto
  }

  // 단일 워크스페이스 조회
  @Get('workspace/:uuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSingleWorkspaceCtrl(@Param('uuid') uuid: string) {
    return this.anonService.getWorkspace(uuid)
  }

  // 단일 워크스페이스 삭제
  @Delete('workspace/:uuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  deleteSingleWorkspaceCtrl(@Param('uuid') uuid: string) {
    return this.anonService.deleteWorkspace(uuid)
  }
}
