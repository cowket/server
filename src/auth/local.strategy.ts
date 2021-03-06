import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private logger: Logger = new Logger('LocalStrategy')

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'pw'
    })
  }

  async validate(email: string, pw: string): Promise<any> {
    const user = await this.authService.validateUser(email, pw)
    if (!user) {
      this.logger.warn(`${email} Not found access`)
      throw new UnauthorizedException()
    }
    return user
  }
}
