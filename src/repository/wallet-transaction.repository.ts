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
    return await this.save(transactionDto);
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
