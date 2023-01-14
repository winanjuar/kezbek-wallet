import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { WalletBalanceHistoryRepository } from './wallet-balance-history.repository';
import { WalletBalanceHistory } from 'src/entity/wallet-balance-history.entity';

describe('WalletBalanceHistoryRepository', () => {
  let walletBalanceHistoryRepository: WalletBalanceHistoryRepository;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletBalanceHistoryRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    walletBalanceHistoryRepository = module.get<WalletBalanceHistoryRepository>(
      WalletBalanceHistoryRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('writeCurrentBalance', () => {
    it('should write current balance', async () => {
      // arrange
      const data: Partial<WalletBalanceHistory> = {
        customer_id: faker.datatype.uuid(),
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date(),
        balance: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      const mockCurrentBalance = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      } as WalletBalanceHistory;

      const spySave = jest
        .spyOn(walletBalanceHistoryRepository, 'save')
        .mockResolvedValue(mockCurrentBalance);

      // act
      const currentBalance =
        await walletBalanceHistoryRepository.writeCurrentBalance(data);

      // assert
      expect(currentBalance).toEqual(mockCurrentBalance);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(data);
    });
  });

  describe('getLastNBalance', () => {
    const customer_id = faker.datatype.uuid();

    const mockBalanceHistoryResult = [];
    for (let i = 0; i <= 5; i++) {
      const mockBalanceHistory: WalletBalanceHistory = {
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date(),
        customer_id,
        balance: faker.datatype.number(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockBalanceHistoryResult.push(mockBalanceHistory);
    }

    it('should return max 10 data balance history', async () => {
      // arrange
      const spyFind = jest
        .spyOn(walletBalanceHistoryRepository, 'find')
        .mockResolvedValue(mockBalanceHistoryResult);

      // act
      const foundBalanceHistory =
        await walletBalanceHistoryRepository.getLastNBalance(customer_id);

      // assert
      expect(foundBalanceHistory).toEqual(mockBalanceHistoryResult);
      expect(foundBalanceHistory.length).toBeLessThanOrEqual(10);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: 10,
        order: { transaction_time: 'DESC' },
      });
    });

    it('should return max n data balance history', async () => {
      // arrange
      const total_required = 15;

      const spyFind = jest
        .spyOn(walletBalanceHistoryRepository, 'find')
        .mockResolvedValue(mockBalanceHistoryResult);

      // act
      const foundBalanceHistory =
        await walletBalanceHistoryRepository.getLastNBalance(
          customer_id,
          total_required,
        );

      // assert
      expect(foundBalanceHistory).toEqual(mockBalanceHistoryResult);
      expect(foundBalanceHistory.length).toBeLessThanOrEqual(total_required);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: total_required,
        order: { transaction_time: 'DESC' },
      });
    });

    it('should return empty array when not found balance history', async () => {
      // arrange
      const spyFind = jest
        .spyOn(walletBalanceHistoryRepository, 'find')
        .mockResolvedValue([]);

      // act
      const foundBalanceHistory =
        await walletBalanceHistoryRepository.getLastNBalance(customer_id);

      // assert
      expect(foundBalanceHistory).toEqual([]);
      expect(foundBalanceHistory.length).toEqual(0);
      expect(spyFind).toHaveBeenCalledTimes(1);
      expect(spyFind).toHaveBeenCalledWith({
        where: { customer_id },
        take: 10,
        order: { transaction_time: 'DESC' },
      });
    });
  });
});
