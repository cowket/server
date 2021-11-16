import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Message } from 'src/entities/message'
import { Reaction } from 'src/entities/reaction'
import { TeamUserProfile } from 'src/entities/team_user_profile'
import { ReactService } from 'src/react/react.service'
import { UtilService } from 'src/util/util.service'
import { MessageService } from './message.service'

class MockMessageRepo {
  db: Partial<Message>[] = [
    {
      uuid: 'test-1',
      content: 'test-1-content'
    }
  ]

  async delete(where: Partial<Message>) {
    const idx = this.db.findIndex((message) => message.uuid === where.uuid)
    let item = null
    if (idx !== -1) {
      item = this.db.splice(idx, 1)
    }
    return item
  }
}

class MockTeamUserProfileRepo {}

class MockReactionRepo {}

describe('MessageService', () => {
  let service: MessageService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: UtilService,
          useValue: {}
        },
        {
          provide: getRepositoryToken(Message),
          useClass: MockMessageRepo
        },
        {
          provide: getRepositoryToken(TeamUserProfile),
          useClass: MockTeamUserProfileRepo
        },
        {
          provide: getRepositoryToken(Reaction),
          useClass: MockReactionRepo
        },
        {
          provide: ReactService,
          useValue: {
            async deleteReactions(uuid: string) {
              return true
            }
          }
        }
      ]
    }).compile()

    service = module.get<MessageService>(MessageService)
  })

  it('defined', () => {
    expect(service).toBeDefined()
  })

  it('deleteMessage', async () => {
    const noMatchUuid = await service.deleteMessage('no-match-uuid')
    expect(noMatchUuid).toBeNull()

    const deletedItem = await service.deleteMessage('test-1')
    expect(deletedItem).not.toBeNull()
  })

  it.todo('deleteDirectMessage')

  it.todo('getMessageByUuid')
})
