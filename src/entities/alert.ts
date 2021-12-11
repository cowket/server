import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from './user'

@Entity({ name: 'alert' })
export class Alert {
  @PrimaryColumn('varchar')
  uuid: string

  @CreateDateColumn()
  create_date: Date

  @Column('boolean', { default: false })
  read: boolean

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid' })
  receive_user: User

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid' })
  send_user: User
}