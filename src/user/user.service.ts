import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateUser, User } from 'src/entities/user'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { UtilService } from 'src/util/util.service'
import { UserGrant } from 'src/entities/user_grant'

@Injectable()
export class UserService {
  private logger = new Logger()

  constructor(
    @InjectRepository(UserGrant)
    private usersGrantRepository: Repository<UserGrant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private utilService: UtilService,
    private configService: ConfigService
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  findOne(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['avatar', 'create_date', 'email', 'password', 'update_date', 'uuid']
    })
  }

  findByUuid(uuid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uuid } })
  }

  async createUser(email: string, pw: string) {
    const uuid = this.utilService.genUuid()
    const identicon = this.utilService.genAvatar(uuid)

    await this.userRepository.insert({
      email,
      password: pw,
      refresh_token: null,
      uuid,
      avatar: identicon
    })

    return this.findByUuid(uuid)
  }

  async cryptPassword(pw: string) {
    const salt = await bcrypt.genSalt(parseInt(this.configService.get('SE_SALT')))
    const crypt = await bcrypt.hash(pw, salt)

    return crypt
  }

  validateEmail(email: string): boolean {
    return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(email)
  }

  validatePw(pw: string): boolean {
    return /^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(pw)
  }

  async findAccessibleTeams(uuid: string) {
    return this.usersGrantRepository
      .createQueryBuilder('user_grant')
      .leftJoinAndSelect('user_grant.team', 'team')
      .leftJoinAndSelect('user_grant.user', 'users')
      .leftJoinAndSelect('team.owner', 'user_grant.user')
      .where('user_grant.user = :uuid AND user_grant.channel IS NULL', { uuid })
      .getMany()
  }

  async updateUser(updateUserData: UpdateUser) {
    const avatarPath =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000/uploads/'
        : this.configService.get('HOST_URL') + '/uploads/'

    return this.userRepository
      .createQueryBuilder('users')
      .update()
      .set({
        avatar: avatarPath + updateUserData.avatar || null
      })
      .where({ uuid: updateUserData.uuid })
      .execute()
  }

  async getRefreshTokenByUuid(uuid: string) {
    return this.userRepository.findOne({
      where: { uuid },
      select: ['refresh_token']
    })
  }

  async setTeamGrant(userUuid: string, teamUuid: string) {
    return this.usersGrantRepository.insert({
      user: { uuid: userUuid },
      team: { uuid: teamUuid }
    })
  }

  async setChannelGrant(userUuid: string, channelUuid: string) {
    return this.usersGrantRepository.insert({
      user: { uuid: userUuid },
      channel: { uuid: channelUuid }
    })
  }

  async findAccessibleChannels(userUuid: string, teamUuid: string) {
    return this.usersGrantRepository
      .createQueryBuilder('userGrant')
      .leftJoinAndSelect('userGrant.team', 'team')
      .leftJoinAndSelect('userGrant.channel', 'channel')
      .where('userGrant.user = :userUuid', { userUuid })
      .andWhere('team.uuid = :teamUuid', { teamUuid })
      .andWhere(' channel.uuid IS NOT NULL')
      .getMany()
  }

  async setSocketId(socketId: string, userUuid: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .update()
      .set({ socket_id: socketId })
      .where('uuid = :userUuid', { userUuid })
      .execute()
  }

  async removeSocketId(socketId: string) {
    return this.userRepository
      .createQueryBuilder('user')
      .update()
      .set({ socket_id: null })
      .where('socket_id = :socketId', { socketId })
      .execute()
  }

  async getUserUuidBySocketId(socketId: string) {
    const user = await this.userRepository.findOne({
      where: { socket_id: socketId }
    })

    return user.uuid
  }

  async getSocketIdByUserUuid(userUuid: string) {
    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
      select: ['socket_id']
    })

    return user.socket_id
  }
}
