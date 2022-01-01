import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AnonymousWorkspace } from 'src/entities/anonymous_workspace'
import { UtilService } from 'src/util/util.service'
import { Repository } from 'typeorm'
import { CreateWorkspaceDto } from './anonymous.dto'

@Injectable()
export class AnonymousService {
  constructor(
    @InjectRepository(AnonymousWorkspace) private workspaceRepo: Repository<AnonymousWorkspace>,
    private utilService: UtilService
  ) {}

  // 모든 워크스페이스 조회한다.
  getWorkspaces() {
    return this.workspaceRepo.find()
  }

  // 단일 워크스페이스를 조회한다.
  getWorkspace(uuid: string) {
    return this.workspaceRepo.findOne({ where: { uuid } })
  }

  // 워크스페이스를 삭제한다.
  deleteWorkspace(uuid: string) {
    return this.workspaceRepo.delete({ uuid })
  }

  // 워크스페이스를 생성한다.
  async createWorkspace(_createWorkSpaceDto: CreateWorkspaceDto) {
    const uuid = this.utilService.genUuid()

    // await this.workspaceRepo.insert({
    //   uuid,
    //   workspace_name: createWorkSpaceDto.workspace_name
    // })

    return this.getWorkspace(uuid)
  }
}
