import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm'
import { Message } from './message'
import { ReactionItem } from './reaction_item'
import { User } from './user'

@Entity('reaction')
export class Reaction {
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message', referencedColumnName: 'uuid' })
  message: Message

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user', referencedColumnName: 'uuid' })
  user: User

  @CreateDateColumn({ name: 'create_date' })
  create_date: Date

  @ManyToOne(() => ReactionItem)
  @JoinColumn({ name: 'content', referencedColumnName: 'id' })
  content: ReactionItem
}
