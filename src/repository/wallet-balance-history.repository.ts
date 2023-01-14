import { Injectable } from '@nestjs/common';
import { WalletBalanceHistory } from 'src/entity/wallet-balance-history.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WalletBalanceHistoryRepository extends Repository<WalletBalanceHistory> {
  constructor(private readonly dataSource: DataSource) {
    super(WalletBalanceHistory, dataSource.createEntityManager());
  }

  async writeCurrentBalance(
    data: Partial<WalletBalanceHistory>,
  ): Promise<WalletBalanceHistory> {
    return await this.save(data);
  }

  async getLastNBalance(
    customer_id: string,
    total?: number,
  ): Promise<WalletBalanceHistory[]> {
    return await this.find({
      where: { customer_id },
      take: total ? total : 10,
      order: { transaction_time: 'DESC' },
    });
  }
}
