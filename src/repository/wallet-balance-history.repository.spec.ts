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
});
