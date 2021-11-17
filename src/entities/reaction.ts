import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Message } from './message'
import { ReactionItem } from './reaction_item'
import { TeamUserProfile } from './team_user_profile'
import { User } from './user'

@Entity('reaction')
export class Reaction {
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn({ name: 'message', referencedColumnName: 'uuid' })
  message?: Message

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user', referencedColumnName: 'uuid' })
  user: User

  @CreateDateColumn({ name: 'create_date' })
  create_date: Date

  @ManyToOne(() => ReactionItem)
  @JoinColumn({ name: 'reaction_item', referencedColumnName: 'id' })
  reaction_item: ReactionItem

  @ManyToOne(() => TeamUserProfile, { nullable: true })
  @JoinColumn({ name: 'team_user_profile', referencedColumnName: 'id' })
  team_user_profile: TeamUserProfile

  @Column('varchar', { nullable: false, default: 'message' })
  match_type: 'message' | 'dm'
}
