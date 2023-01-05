import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';
import { ETransactionType } from './core/type-transaction.enum';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { WalletBalanceActual } from './entity/wallet-balance-actual.entity';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { WalletBalanceActualRepository } from './repository/wallet-balance-actual.repository';
import { WalletBalanceHistoryRepository } from './repository/wallet-balance-history.repository';
import { WalletTransactionRepository } from './repository/wallet-transaction.repository';

describe('AppService', () => {
  let appService: AppService;
  let mockBalanceActual: WalletBalanceActual;

  const mockBalanceHistoryRepo = {
    writeCurrentBalance: jest.fn(),
  };

  const mockTransactionRepo = {
    createNewTransaction: jest.fn(),
    getLastNTransaction: jest.fn(),
  };

  const mockBalanceActualRepo = {
    getActualBalanceByCustomerId: jest.fn(() =>
      Promise.resolve(mockBalanceActual),
    ),
    createFirstBalance: jest.fn(),
    updateExistingBalance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: WalletBalanceHistoryRepository,
          useValue: mockBalanceHistoryRepo,
        },
        {
          provide: WalletBalanceActualRepository,
          useValue: mockBalanceActualRepo,
        },
        { provide: WalletTransactionRepository, useValue: mockTransactionRepo },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createNewTransaction', () => {
    let transactionDto: CreateTransactionRequestDto;
    let mockTransaction: WalletTransaction;
    let mockActualBalance: WalletBalanceActual;

    beforeEach(async () => {
      const customer_id = faker.datatype.uuid();

      transactionDto = {
        transaction_id: faker.datatype.uuid(),
        customer_id,
        transaction_time: new Date(),
        transaction_type: ETransactionType.IN,
        transaction_description: 'Unit test wallet',
        amount: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      mockTransaction = {
        ...transactionDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockActualBalance = {
        customer_id,
        last_transaction_id: faker.datatype.uuid(),
        last_transaction_time: new Date(),
        current_balance: faker.helpers.arrayElement([50000, 25000, 100000]),
        updated_at: new Date(),
        created_at: new Date(),
      };
    });

    it('should return new transaction just create', async () => {
      // arrange
      const spyCreateNewTransaction = jest
        .spyOn(mockTransactionRepo, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      const spyGetActualBalanceByCustomerId = jest
        .spyOn(mockBalanceActualRepo, 'getActualBalanceByCustomerId')
        .mockResolvedValue(mockActualBalance);

      // act
      const newTransaction = await appService.createNewTransaction(
        transactionDto,
      );

      // assert
      expect(newTransaction).toEqual(mockTransaction);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(transactionDto);
      expect(spyGetActualBalanceByCustomerId).toHaveBeenCalledTimes(1);
    });

    it('should return new transaction just created, substrack current balance because transaction type is OUT', async () => {
      // arrange
      transactionDto.transaction_type = ETransactionType.OUT;
      mockTransaction.transaction_type = transactionDto.transaction_type;

      const spyCreateNewTransaction = jest
        .spyOn(mockTransactionRepo, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      const spyGetActualBalanceByCustomerId = jest
        .spyOn(mockBalanceActualRepo, 'getActualBalanceByCustomerId')
        .mockResolvedValue(mockActualBalance);

      mockActualBalance.current_balance -= transactionDto.amount;

      // act
      const newTransaction = await appService.createNewTransaction(
        transactionDto,
      );

      // assert
      expect(newTransaction).toEqual(mockTransaction);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(transactionDto);
      expect(spyGetActualBalanceByCustomerId).toHaveBeenCalledTimes(1);
    });

    it('should return new transaction just created, and insert to actual and history for first time', async () => {
      // arrange
      const spyCreateNewTransaction = jest
        .spyOn(mockTransactionRepo, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      const spyGetActualBalanceByCustomerId = jest
        .spyOn(mockBalanceActualRepo, 'getActualBalanceByCustomerId')
        .mockResolvedValue(null);

      // act
      const newTransaction = await appService.createNewTransaction(
        transactionDto,
      );

      // assert
      expect(newTransaction).toEqual(mockTransaction);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(transactionDto);
      expect(spyGetActualBalanceByCustomerId).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLastTransactions', () => {
    const customer_id = faker.datatype.uuid();

    const transactionDto: GetTransactionRequestDto = {
      customer_id,
      total: faker.datatype.number({ min: 1 }),
    };

    it('should return max n data transactions', async () => {
      // arrange
      const mockResultNTransactions = [
        {
          transaction_id: faker.datatype.uuid(),
          customer_id: customer_id,
          transaction_type: faker.helpers.arrayElement([
            ETransactionType.IN,
            ETransactionType.OUT,
          ]),
          transaction_description: 'Unit test wallet',
          amount: faker.helpers.arrayElement([5000, 7500, 10000]),
          transaction_time: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const spyGetLastNTransaction = jest
        .spyOn(mockTransactionRepo, 'getLastNTransaction')
        .mockResolvedValue(mockResultNTransactions);

      // act
      const transactions = await appService.getLastTransactions(transactionDto);

      // assert
      expect(transactions).toEqual(mockResultNTransactions);
      expect(spyGetLastNTransaction).toHaveBeenCalledTimes(1);
    });

    it('should return max 10 transactions when not send total', async () => {
      // arrange
      delete transactionDto.total;

      const mockResultNTransactions = [
        {
          transaction_id: faker.datatype.uuid(),
          customer_id: customer_id,
          transaction_type: faker.helpers.arrayElement([
            ETransactionType.IN,
            ETransactionType.OUT,
          ]),
          transaction_description: 'Unit test wallet',
          amount: faker.helpers.arrayElement([5000, 7500, 10000]),
          transaction_time: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const spyGetLastNTransaction = jest
        .spyOn(mockTransactionRepo, 'getLastNTransaction')
        .mockResolvedValue(mockResultNTransactions);

      // act
      const transactions = await appService.getLastTransactions(transactionDto);

      // assert
      expect(transactions).toEqual(mockResultNTransactions);
      expect(spyGetLastNTransaction).toHaveBeenCalledTimes(1);
    });

    it('should throw not found exception', async () => {
      // arrange
      const spyGetLastNTransaction = jest
        .spyOn(mockTransactionRepo, 'getLastNTransaction')
        .mockResolvedValue([]);

      // act
      const funGetLastTransactions =
        appService.getLastTransactions(transactionDto);

      // assert
      await expect(funGetLastTransactions).rejects.toEqual(
        new NotFoundException(`Customer still doesn't have any transactions`),
      );
      expect(spyGetLastNTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
