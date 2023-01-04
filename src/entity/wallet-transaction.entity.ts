import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallet_transaction')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Index()
  @Column('uuid')
  customer_id: string;

  @Column()
  transaction_time: Date;

  @Column()
  transaction_type: string;

  @Column()
  transaction_description: string;

  @Column()
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
