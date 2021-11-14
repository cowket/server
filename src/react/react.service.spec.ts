import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Reaction } from 'src/entities/reaction'
import { ReactionItem } from 'src/entities/reaction_item'
import { ReactService } from './react.service'

let service: ReactService

type MockFindOpts<T> = {
  where: Partial<T>
}

class MockReactionRepo {
  mockDB: Partial<Reaction>[] = [
    {
      content: {
        content: '🔥',
        id: 1,
        create_date: new Date()
      },
      create_date: new Date()
    }
  ]

  async findOne(t: MockFindOpts<Reaction>) {
    const reaction = new Reaction()
    reaction.uuid = 'test-uuid'
    reaction.content = {
      content: '🔥',
      id: 1,
      create_date: new Date()
    }

    return reaction
  }
}

class MockReactionItemRepo {
  mockDB: ReactionItem[] = [
    {
      content: '🔥',
      id: 1,
      create_date: new Date()
    },
    {
      content: '🤣',
      id: 2,
      create_date: new Date()
    }
  ]

  async findOne(t: MockFindOpts<ReactionItem>) {
    const keyName = t.where.id !== undefined ? 'id' : 'content'

    return this.mockDB.find((item) => item[keyName] === t.where[keyName])
  }

  async save(t: Partial<ReactionItem>) {
    const findResult = this.mockDB.find((item) => item.content === t.content)

    if (!findResult) {
      return {
        ...t,
        id: this.mockDB[this.mockDB.length - 1].id + 1
      }
    } else {
      return findResult
    }
  }
}

describe('ReactService', () => {
  beforeEach(async () => {
    const m = await Test.createTestingModule({
      providers: [
        ReactService,
        {
          provide: getRepositoryToken(Reaction),
          useClass: MockReactionRepo
        },
        {
          provide: getRepositoryToken(ReactionItem),
          useClass: MockReactionItemRepo
        }
      ]
    }).compile()

    service = m.get<ReactService>(ReactService)
  })

  it('define', () => {
    expect(service).toBeDefined()
  })

  it.todo('createReaction')

  it('saveReactionItem', async () => {
    const reactionItem = await service.saveReactionItem('😊')
    expect(reactionItem.content).toEqual('😊')
    expect(reactionItem.id).toEqual(3)

    const existReactionItem = await service.saveReactionItem('🔥')
    expect(existReactionItem.content).toEqual('🔥')
    expect(existReactionItem.id).toEqual(1)
  })

  it('findReactionItemById', async () => {
    const existReactionItem = await service.findReactionItemById(1)
    expect(existReactionItem).toBeTruthy()
    expect(existReactionItem.content).toEqual('🔥')
    expect(existReactionItem.id).toEqual(1)

    const notExistReactionItem = await service.findReactionItemById(4)
    expect(notExistReactionItem).toBeFalsy()
  })

  it('findReactionItemByContent', async () => {
    const existReactionItem = await service.findReactionitemByContent('🔥')
    expect(existReactionItem).toBeTruthy()
    expect(existReactionItem.content).toEqual('🔥')
    expect(existReactionItem.id).toEqual(1)

    const notExistReactionItem = await service.findReactionitemByContent('🚗')
    expect(notExistReactionItem).toBeFalsy()
  })

  it.todo('findReactions (By message)')

  it.todo('deleteReactions (Multiple)')

  it.todo('deleteReaction (Single)')
})
