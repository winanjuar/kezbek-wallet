import { ETransactionType } from './type-transaction.enum';

export interface IResponseInfoTransaction {
  transaction_id: string;
  transaction_time: Date;
  transaction_type: ETransactionType;
  transaction_description: string;
  current_balance: number;
}
