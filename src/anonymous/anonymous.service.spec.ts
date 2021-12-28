import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AnonymousUser } from 'src/entities/anonymous_user'
import { AnonymousWorkspace } from 'src/entities/anonymous_workspace'
import { UtilService } from 'src/util/util.service'
import { AnonymousService } from './anonymous.service'

describe('AnonymousService', () => {
  let service: AnonymousService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymousService,
        {
          provide: getRepositoryToken(AnonymousUser),
          useClass: class {}
        },
        {
          provide: getRepositoryToken(AnonymousWorkspace),
          useClass: class {}
        },
        {
          provide: UtilService,
          useValue: {
            genUuid: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<AnonymousService>(AnonymousService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
