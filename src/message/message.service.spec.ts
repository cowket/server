import { Test, TestingModule } from '@nestjs/testing'
import { MessageService } from './message.service'

describe('MessageService', () => {
  let service: MessageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessageService]
    }).compile()

    service = module.get<MessageService>(MessageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('fetch from latest message', async () => {
    const message = {
      latestMessage: {
        create_date: new Date('2021-10-04 20:21:38.177000')
      }
    }

    const t = await service.fetchMessageFromLatest(message)
    console.log(t)
  })
})
