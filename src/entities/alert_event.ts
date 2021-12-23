import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('alert_event')
export class AlertEvent {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column('varchar')
  name: string
}
