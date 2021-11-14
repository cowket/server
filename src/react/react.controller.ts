import { Controller } from '@nestjs/common'
import { ReactService } from './react.service'

@Controller('react')
export class ReactController {
  constructor(private reactService: ReactService) {}

  // @Get()
  // async getTest() {
  //   return this.reactService.findReactions('1')
  // }
}
