import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Alert } from 'src/entities/alert'
import { Repository } from 'typeorm'

@Injectable()
export class AlertService {
  constructor(@InjectRepository(Alert) private alertRepo: Repository<Alert>) {}

  // alert uuid로 alert을 찾는다.
  async getAlertByUuid(uuid: string) {
    return this.alertRepo.findOne({ where: { uuid } })
  }

  // 받는 유저의 uuid로 alert을 찾는다.
  async getAlertByReceiver(uuid: string) {
    return this.alertRepo.find({ where: { receive_user: { uuid } } })
  }

  // 보낸 유저의 uuid로 alert을 찾는다.
  async getAlertBySender(uuid: string) {
    return this.alertRepo.find({ where: { send_user: { uuid } } })
  }

  // 채널의 모든 유저에게 alert을 생성한다.
  // async createAlertInChannel(channelUuid: string, senderUuid: string) {}
}
