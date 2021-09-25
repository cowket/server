import { User } from 'src/entities/user'

export type TokenUserInfo = Pick<User, 'avatar' | 'email' | 'uuid'>
