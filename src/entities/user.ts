import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn
} from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @PrimaryColumn('varchar')
  uuid: string

  @Column('varchar', { length: 100 })
  email: string

  @Column('varchar', { length: 200 })
  password: string

  @Column()
  refresh_token: string

  @Column('varchar', { length: 500 })
  avatar: string

  @CreateDateColumn()
  create_date: Date

  @UpdateDateColumn()
  update_date: Date
}
