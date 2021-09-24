import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MessageService {
  private logger = new Logger()

  sendMessage(data) {
    this.logger.log(data)
  }
}
