import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MessageService } from 'src/message/message.service'

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name)

  constructor(private messageService: MessageService) {}

  @Cron(CronExpression.EVERY_30_MINUTES, {
    name: 'Message Collector Task',
    timeZone: 'Asia/Seoul'
  })
  async messageCollectorTask() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('task run: removeUnstableMessages')
      await this.messageService.removeUnstableMessages()
      this.logger.log('task run: removeUnstableDirectMessages')
      await this.messageService.removeUnstableDirectMessages()
    }
  }
}
