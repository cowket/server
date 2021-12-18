import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Alert } from 'src/entities/alert'
import { AlertService } from './alert.service'

class MockAlertRepo {}

describe('AlertService', () => {
  let service: AlertService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        {
          provide: getRepositoryToken(Alert),
          useClass: MockAlertRepo
        }
      ]
    }).compile()

    service = module.get<AlertService>(AlertService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
