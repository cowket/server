import { Injectable } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
// import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, pw: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(email)

      if (!user) return null

      // TODO 전달된 비밀번호 <-> DB에 암호화된 비밀번호 비교 필요
      // 테스트
      return user
    } catch (error) {} // 에러 핸들 필요
  }
}
