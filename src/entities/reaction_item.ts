import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('reaction_item')
export class ReactionItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  content: string

  @CreateDateColumn()
  create_date: Date
}
