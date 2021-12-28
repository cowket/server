import { Test, TestingModule } from '@nestjs/testing'
import { AnonymousService } from './anonymous.service'

describe('AnonymousService', () => {
  let service: AnonymousService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnonymousService]
    }).compile()

    service = module.get<AnonymousService>(AnonymousService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
