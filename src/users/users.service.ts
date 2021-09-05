import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entities/user'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
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
      update_date: new Date()
    })
  }
}
