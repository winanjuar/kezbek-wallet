import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { WalletTransactionRepository } from './wallet-transaction.repository';
import { WalletTransaction } from 'src/entity/wallet-transaction.entity';
import { ETransactionType } from 'src/core/type-transaction.enum';
import { CreateTransactionRequestDto } from 'src/dto/request/create-transaction.request.dto';

describe('WalletTransactionRepository', () => {
  let walletTransactionRepository: WalletTransactionRepository;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletTransactionRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    walletTransactionRepository = module.get<WalletTransactionRepository>(
      WalletTransactionRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('createNewTransaction', () => {
    it('should return new transaction', async () => {
      // arrange
      const transactionDto: CreateTransactionRequestDto = {
        transaction_id: faker.datatype.uuid(),
        customer_id: faker.datatype.uuid(),
        transaction_time: new Date(),
        transaction_type: faker.helpers.arrayElement([
          ETransactionType.IN,
          ETransactionType.OUT,
        ]),
        transaction_description: 'Unit test wallet',
        amount: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      const mockTransactionResult: WalletTransaction = {
        ...transactionDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const spySave = jest
        .spyOn(walletTransactionRepository, 'save')
        .mockResolvedValue(mockTransactionResult);

      // act
      const newTransaction =
        await walletTransactionRepository.createNewTransaction(transactionDto);

      // assert
      expect(newTransaction).toEqual(mockTransactionResult);
      expect(spySave).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLastNTransaction', () => {
    const customer_id = faker.datatype.uuid();

    const mockTransactionsResult = [];
    for (let i = 0; i <= 5; i++) {
      const mockTransaction: WalletTransaction = {
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
      };
      mockTransactionsResult.push(mockTransaction);
    }

    it('should return max 10 data transactions', async () => {
      // arrange
      const spyFind = jest
        .spyOn(walletTransactionRepository, 'find')
        .mockResolvedValue(mockTransactionsResult);

      // act
      const foundTransactions =
        await walletTransactionRepository.getLastNTransaction(customer_id);

      // assert
      expect(foundTransactions).toEqual(mockTransactionsResult);
      expect(foundTransactions.length).toBeLessThanOrEqual(10);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: 10,
        order: { transaction_time: 'DESC' },
      });
    });

    it('should return max n data transactions', async () => {
      // arrange
      const total_required = 15;

      const spyFind = jest
        .spyOn(walletTransactionRepository, 'find')
        .mockResolvedValue(mockTransactionsResult);

      // act
      const foundTransactions =
        await walletTransactionRepository.getLastNTransaction(
          customer_id,
          total_required,
        );

      // assert
      expect(foundTransactions).toEqual(mockTransactionsResult);
      expect(foundTransactions.length).toBeLessThanOrEqual(total_required);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: total_required,
        order: { transaction_time: 'DESC' },
      });
    });

    it('should return empty array when not found transactions', async () => {
      // arrange
      const spyFind = jest
        .spyOn(walletTransactionRepository, 'find')
        .mockResolvedValue([]);

      // act
      const foundTransactions =
        await walletTransactionRepository.getLastNTransaction(customer_id);

      // assert
      expect(foundTransactions).toEqual([]);
      expect(foundTransactions.length).toEqual(0);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: 10,
        order: { transaction_time: 'DESC' },
      });
    });
  });
});
