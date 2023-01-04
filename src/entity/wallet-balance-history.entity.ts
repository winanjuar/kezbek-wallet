import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallet_balance_history')
export class WalletBalanceHistory {
  @PrimaryColumn('uuid')
  transaction_id: string;

  @Column()
  transaction_time: Date;

  @Index()
  @Column('uuid')
  customer_id: string;

  @Column()
  balance: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
