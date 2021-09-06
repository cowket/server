import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { UtilService } from 'src/util/util.service'

@Injectable()
export class UsersService {
  private logger = new Logger()

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
    private utilService: UtilService
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  findOne(email: string): Promise<User> | null {
    return this.usersRepository.findOne({ where: { email } })
  }

  createUser(email: string, pw: string) {
    return this.usersRepository.insert({
      email,
      password: pw,
      create_date: new Date(),
      update_date: new Date(),
      uuid: this.utilService.genUuid()
    })
  }

  async cryptPassword(pw: string) {
    const salt = await bcrypt.genSalt(this.configService.get('SE_SALT'))
    const crypt = await bcrypt.hash(pw, salt)
    this.logger.log(crypt)

    return crypt
  }
}
