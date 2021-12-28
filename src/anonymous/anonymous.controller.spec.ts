import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AnonymousUser } from 'src/entities/anonymous_user'
import { AnonymousWorkspace } from 'src/entities/anonymous_workspace'
import { UtilService } from 'src/util/util.service'
import { AnonymousController } from './anonymous.controller'
import { AnonymousService } from './anonymous.service'

describe('AnonymousController', () => {
  let controller: AnonymousController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnonymousController],
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

    controller = module.get<AnonymousController>(AnonymousController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
