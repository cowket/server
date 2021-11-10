import { Message } from './../entities/message'
import { createConnection, Connection } from 'typeorm'

let connection: Connection

describe('Task Service', () => {
  beforeEach(async () => {
    return await createConnection({
      type: 'sqlite',
      database: ':memory:',
      dropSchema: true,
      entities: [Message],
      synchronize: true,
      logging: false
    })
  })

  test(() => {
    except(connection).toBeTruthy()
  })
})
