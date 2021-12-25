import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { AnonymousWorkspace } from './anonymous_workspace'

@Entity('anonymous_user')
export class AnonymousUser {
  @PrimaryColumn({ type: 'varchar', nullable: false })
  uuid: string

  @Column('varchar', { nullable: false, length: 100, name: 'display_name' })
  display_name: string

  @Column('varchar', { nullable: true, name: 'socket_id' })
  socket_id: string

  @ManyToOne(() => AnonymousWorkspace, { nullable: true })
  @JoinColumn({ name: 'workspace', referencedColumnName: 'uuid' })
  workspace: AnonymousWorkspace
}
