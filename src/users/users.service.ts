import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateUser, User } from 'src/entities/user'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config'
import { UtilService } from 'src/util/util.service'
import { UserGrant } from 'src/entities/user_grant'

@Injectable()
export class UsersService {
  private logger = new Logger()

  constructor(
    @InjectRepository(UserGrant)
    private usersGrantRepository: Repository<UserGrant>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private utilService: UtilService,
    private configService: ConfigService
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['avatar', 'create_date', 'email', 'password', 'update_date', 'uuid']
    })
  }

  findByUuid(uuid: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { uuid } })
  }

  createUser(email: string, pw: string) {
    const uuid = this.utilService.genUuid()
    const identicon = this.utilService.genAvatar(uuid)

    return this.usersRepository.insert({
      email,
      password: pw,
      create_date: new Date(),
      update_date: new Date(),
      refresh_token: null,
      uuid,
      avatar: identicon
    })
  }

  async cryptPassword(pw: string) {
    const salt = await bcrypt.genSalt(parseInt(this.configService.get('SE_SALT')))
    const crypt = await bcrypt.hash(pw, salt)
    this.logger.log(crypt)

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
      .leftJoinAndSelect('user_grant.team_uuid', 'team')
      .leftJoinAndSelect('user_grant.user_uuid', 'users')
      .leftJoinAndSelect('team.owner', 'user_grant.user_uuid')
      .where({ user_uuid: uuid, channel_uuid: null })
      .getMany()
  }

  async updateUser(updateUserData: UpdateUser) {
    const avatarPath =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000/uploads/'
        : this.configService.get('HOST_URL') + '/uploads/'

    return this.usersRepository
      .createQueryBuilder('users')
      .update()
      .set({
        avatar: avatarPath + updateUserData.avatar || null,
        update_date: new Date()
      })
      .where({ uuid: updateUserData.uuid })
      .execute()
  }

  async getRefreshTokenByUuid(uuid: string) {
    return this.usersRepository.findOne({
      where: { uuid },
      select: ['refresh_token']
    })
  }

  async setTeamGrant(userUuid: string, teamUuid: string) {
    return this.usersGrantRepository.insert({
      user_uuid: { uuid: userUuid },
      team_uuid: { uuid: teamUuid },
      create_date: new Date()
    })
  }

  async setChannelGrant(userUuid: string, channelUuid: string) {
    return this.usersGrantRepository.insert({
      user_uuid: { uuid: userUuid },
      channel_uuid: { uuid: channelUuid },
      create_date: new Date()
    })
  }

  async findAccessibleChannels(userUuid: string, teamUuid: string) {
    return this.usersGrantRepository
      .createQueryBuilder('userGrant')
      .leftJoinAndSelect('userGrant.team_uuid', 'team')
      .leftJoinAndSelect('userGrant.channel_uuid', 'channel')
      .where('user_uuid = :userUuid', { userUuid })
      .andWhere('team.uuid = :teamUuid', { teamUuid })
      .andWhere(' channel.uuid IS NOT NULL')
      .getMany()
  }

  async setSocketId(socketId: string, userUuid: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .update()
      .set({ socket_id: socketId })
      .where('uuid = :userUuid', { userUuid })
      .execute()
  }

  async removeSocketId(socketId: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .update()
      .set({ socket_id: null })
      .where('socket_id = :socketId', { socketId })
      .execute()
  }

  async getUserUuidBySocketId(socketId: string) {
    const user = await this.usersRepository.findOne({
      where: { socket_id: socketId }
    })

    return user.uuid
  }

  async getSocketIdByUserUuid(userUuid: string) {
    const user = await this.usersRepository.findOne({
      where: { uuid: userUuid },
      select: ['socket_id']
    })

    return user.socket_id
  }
}
