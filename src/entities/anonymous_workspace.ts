import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { AnonymousUser } from './anonymous_user'

@Entity('anonymous_workspace')
export class AnonymousWorkspace {
  @PrimaryColumn('varchar', { nullable: false })
  uuid: string

  @OneToOne(() => AnonymousUser)
  @JoinColumn({ name: 'owner', referencedColumnName: 'uuid' })
  owner: AnonymousUser

  @CreateDateColumn()
  create_date: Date

  @Column('varchar', { name: 'shortly_id', primary: true, nullable: false, length: 50 })
  shortly_id: string
}
