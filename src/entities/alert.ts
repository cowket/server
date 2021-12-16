import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { User } from './user'

export type AlertType = 'reaction' | 'message' | 'mention'

@Entity({ name: 'alert' })
export class Alert {
  @PrimaryColumn('varchar')
  uuid: string

  @CreateDateColumn()
  create_date: Date

  @Column('boolean', { default: false })
  read: boolean

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'receive_user' })
  receive_user: User

  @ManyToOne(() => User)
  @JoinColumn({ referencedColumnName: 'uuid', name: 'send_user' })
  send_user: User

  @Column('varchar', { nullable: false, length: 50 })
  alert_type: AlertType
}
