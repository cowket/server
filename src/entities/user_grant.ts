import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'user_grant' })
export class UserGrant {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @Column('varchar')
  user_uuid: string

  @Column()
  team_id: number

  @Column('varchar')
  team_uuid: string
}
