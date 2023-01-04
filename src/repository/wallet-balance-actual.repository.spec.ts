import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { WalletBalanceActualRepository } from './wallet-balance-actual.repository';
import { WalletBalanceActual } from 'src/entity/wallet-balance-actual.entity';

describe('WalletBalanceActualRepository', () => {
  let walletBalanceActualRepository: WalletBalanceActualRepository;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletBalanceActualRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    walletBalanceActualRepository = module.get<WalletBalanceActualRepository>(
      WalletBalanceActualRepository,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('createFirstBalance', () => {
    it('should create first balance', async () => {
      // arrange
      const data: Partial<WalletBalanceActual> = {
        customer_id: faker.datatype.uuid(),
        last_transaction_id: faker.datatype.uuid(),
        last_transaction_time: new Date(),
        current_balance: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      const mockActualBalance = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      } as WalletBalanceActual;

      const spySave = jest
        .spyOn(walletBalanceActualRepository, 'save')
        .mockResolvedValue(mockActualBalance);

      // act
      const firstBalance =
        await walletBalanceActualRepository.createFirstBalance(data);

      // assert
      expect(firstBalance).toEqual(mockActualBalance);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(data);
    });
  });

  describe('updateExistingBalance', () => {
    it('should update exist balance', async () => {
      // arrange
      const data: Partial<WalletBalanceActual> = {
        customer_id: faker.datatype.uuid(),
        last_transaction_id: faker.datatype.uuid(),
        last_transaction_time: new Date(),
        current_balance: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      const mockActualBalance = {
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      } as WalletBalanceActual;

      const spySave = jest
        .spyOn(walletBalanceActualRepository, 'save')
        .mockResolvedValue(mockActualBalance);

      // act
      const updatedBalance =
        await walletBalanceActualRepository.updateExistingBalance(data);

      // assert
      expect(updatedBalance).toEqual(mockActualBalance);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(data);
    });
  });

  describe('getActualBalanceByCustomerId', () => {
    const customer_id = faker.datatype.uuid();

    const mockActualBalance: WalletBalanceActual = {
      customer_id: customer_id,
      last_transaction_id: faker.datatype.uuid(),
      last_transaction_time: new Date(),
      current_balance: faker.helpers.arrayElement([50000, 75000, 100000]),
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return actual balance', async () => {
      // arrange
      const spyLastTransaction = jest
        .spyOn(walletBalanceActualRepository, 'findOne')
        .mockResolvedValue(mockActualBalance);

      // act
      const actualBalance =
        await walletBalanceActualRepository.getActualBalanceByCustomerId(
          customer_id,
        );

      // assert
      expect(actualBalance).toEqual(mockActualBalance);
      expect(spyLastTransaction).toHaveBeenCalledTimes(1);
      expect(spyLastTransaction).toHaveBeenCalledWith({
        where: { customer_id },
      });
    });

    it('should return null when does not have balance yet', async () => {
      // arrange
      const spyLastTransaction = jest
        .spyOn(walletBalanceActualRepository, 'findOne')
        .mockResolvedValue(null);

      // act
      const actualBalance =
        await walletBalanceActualRepository.getActualBalanceByCustomerId(
          customer_id,
        );

      // assert
      expect(actualBalance).toEqual(null);
      expect(spyLastTransaction).toHaveBeenCalledTimes(1);
      expect(spyLastTransaction).toHaveBeenCalledWith({
        where: { customer_id },
      });
    });
  });
});
