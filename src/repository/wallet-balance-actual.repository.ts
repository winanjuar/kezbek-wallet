import { Injectable } from '@nestjs/common';
import { WalletBalanceActual } from 'src/entity/wallet-balance-actual.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WalletBalanceActualRepository extends Repository<WalletBalanceActual> {
  constructor(private readonly dataSource: DataSource) {
    super(WalletBalanceActual, dataSource.createEntityManager());
  }

  async getActualBalanceByCustomerId(
    customer_id: string,
  ): Promise<WalletBalanceActual> {
    return await this.findOne({
      where: { customer_id },
    });
  }

  async createFirstBalance(
    data: Partial<WalletBalanceActual>,
  ): Promise<WalletBalanceActual> {
    return await this.save(data);
  }

  async updateExistingBalance(
    data: Partial<WalletBalanceActual>,
  ): Promise<WalletBalanceActual> {
    return await this.save(data);
  }
}
