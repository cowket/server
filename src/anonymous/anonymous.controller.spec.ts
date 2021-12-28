import { Test, TestingModule } from '@nestjs/testing'
import { AnonymousController } from './anonymous.controller'

describe('AnonymousController', () => {
  let controller: AnonymousController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnonymousController]
    }).compile()

    controller = module.get<AnonymousController>(AnonymousController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
