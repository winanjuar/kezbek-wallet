import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletTransaction } from 'src/entity/wallet-transaction.entity';
import { CreateTransactionRequestDto } from 'src/dto/request/create-transaction.request.dto';

@Injectable()
export class WalletTransactionRepository extends Repository<WalletTransaction> {
  constructor(private readonly dataSource: DataSource) {
    super(WalletTransaction, dataSource.createEntityManager());
  }

  async createNewTransaction(transactionDto: CreateTransactionRequestDto) {
    const dataTransaction: Partial<WalletTransaction> = {
      customer_id: transactionDto.customer_id,
      transaction_time: new Date(),
      transaction_type: transactionDto.transaction_type,
      transaction_description: transactionDto.transaction_description,
      amount: transactionDto.amount,
    };
    return await this.save(dataTransaction);
  }

  async getLastNTransaction(
    customer_id: string,
    total?: number,
  ): Promise<WalletTransaction[]> {
    return await this.find({
      where: { customer_id },
      take: total ? total : 10,
      order: { transaction_time: 'DESC' },
    });
  }
}
