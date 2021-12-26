import { Test } from '@nestjs/testing'
import { UtilService } from './util.service'
import { ConfigModule } from '@nestjs/config'

describe('UtilService', () => {
  let service: UtilService

  beforeEach(async () => {
    const compiledModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [UtilService],
      exports: [UtilService]
    }).compile()

    service = await compiledModule.resolve(UtilService)
  })

  describe('isIncludeMention', () => {
    it('pass no included message text', () => {
      const testMessage = '<p>Normal Message</p>'
      expect(service.isIncludeMention(testMessage)).toBeFalsy()
    })

    it('pass included message text', () => {
      const testMessage = `
        <p>
          <mention id="12345">@Some User</mention>
          , Hello
        </p>
      `
      expect(service.isIncludeMention(testMessage)).toBeTruthy()
    })
  })
})
