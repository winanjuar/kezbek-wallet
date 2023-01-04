import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ETransactionType } from './core/type-transaction.enum';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { WalletBalanceActual } from './entity/wallet-balance-actual.entity';
import { WalletBalanceHistory } from './entity/wallet-balance-history.entity';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { WalletBalanceActualRepository } from './repository/wallet-balance-actual.repository';
import { WalletBalanceHistoryRepository } from './repository/wallet-balance-history.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly walletTransactionRepository: WalletTransactionRepository,
    private readonly walletBalanceActualRepository: WalletBalanceActualRepository,
    private readonly walletBalanceHistoryRepository: WalletBalanceHistoryRepository,
  ) {}

  async createNewTransaction(
    transactionDto: CreateTransactionRequestDto,
  ): Promise<WalletTransaction> {
    const currentTransaction =
      await this.walletTransactionRepository.createNewTransaction(
        transactionDto,
      );
    const lastActualBalance =
      await this.walletBalanceActualRepository.getActualBalanceByCustomerId(
        transactionDto.customer_id,
      );
    if (!lastActualBalance) {
      const firstActualBalance: Partial<WalletBalanceActual> = {
        customer_id: currentTransaction.customer_id,
        last_transaction_id: currentTransaction.transaction_id,
        last_transaction_time: currentTransaction.transaction_time,
        current_balance:
          currentTransaction.transaction_type === 'IN'
            ? currentTransaction.amount
            : -currentTransaction.amount,
      };
      await this.walletBalanceActualRepository.createFirstBalance(
        firstActualBalance,
      );
      this.logger.log(
        `[AppService] Write current actual balance for the first time`,
      );

      const firstCurrentBalance: Partial<WalletBalanceHistory> = {
        customer_id: currentTransaction.customer_id,
        transaction_id: currentTransaction.transaction_id,
        transaction_time: currentTransaction.transaction_time,
        balance:
          currentTransaction.transaction_type === 'IN'
            ? currentTransaction.amount
            : -currentTransaction.amount,
      };
      await this.walletBalanceHistoryRepository.writeCurrentBalance(
        firstCurrentBalance,
      );
      this.logger.log(
        `[AppService] Write current history balance for the first time`,
      );
    } else {
      delete lastActualBalance.created_at;
      delete lastActualBalance.updated_at;

      lastActualBalance.last_transaction_id = currentTransaction.transaction_id;
      lastActualBalance.last_transaction_time =
        currentTransaction.transaction_time;

      if (currentTransaction.transaction_type === ETransactionType.IN) {
        lastActualBalance.current_balance += currentTransaction.amount;
      } else {
        lastActualBalance.current_balance -= currentTransaction.amount;
      }

      await this.walletBalanceActualRepository.updateExistingBalance(
        lastActualBalance,
      );
      this.logger.log(`[AppService] Write current actual balance`);

      const lastCurrentBalance: Partial<WalletBalanceHistory> = {
        customer_id: currentTransaction.customer_id,
        transaction_id: currentTransaction.transaction_id,
        transaction_time: currentTransaction.transaction_time,
        balance: lastActualBalance.current_balance,
      };
      await this.walletBalanceHistoryRepository.writeCurrentBalance(
        lastCurrentBalance,
      );
      this.logger.log(`[AppService] Write current history balance`);
    }

    return currentTransaction;
  }

  async getLastTransactions(
    transactionDto: GetTransactionRequestDto,
  ): Promise<WalletTransaction[]> {
    let lastTransactions: WalletTransaction[];
    if (transactionDto.total) {
      lastTransactions =
        await this.walletTransactionRepository.getLastNTransaction(
          transactionDto.customer_id,
          transactionDto.total,
        );
    } else {
      lastTransactions =
        await this.walletTransactionRepository.getLastNTransaction(
          transactionDto.customer_id,
        );
    }

    if (lastTransactions.length === 0) {
      throw new NotFoundException(
        `Customer still doesn't have any transactions`,
      );
    }
    return lastTransactions;
  }
}
