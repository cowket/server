let connection

describe('Task Service', () => {
  beforeEach(() => {
    connection = 'test'
  })
  test('connection', () => {
    expect(connection).toBeTruthy()
  })
})
