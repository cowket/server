import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserGrant } from 'src/entities/user_grant'
import { Repository } from 'typeorm'

@Injectable()
export class GrantService {
  constructor(
    @InjectRepository(UserGrant)
    private readonly userGrantRepo: Repository<UserGrant>
  ) {}
}
