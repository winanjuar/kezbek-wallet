import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallet_balance_actual')
export class WalletBalanceActual {
  @PrimaryColumn('uuid')
  customer_id: string;

  @Column('uuid')
  last_transaction_id: string;

  @Column()
  last_transaction_time: Date;

  @Column()
  current_balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
