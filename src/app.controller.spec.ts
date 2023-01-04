import { faker } from '@faker-js/faker';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { pick } from 'lodash';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ETransactionType } from './core/type-transaction.enum';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { CreateTransactionResponseDto } from './dto/response/create-transaction.response.dto';
import { ManyTransactionsResponseDto } from './dto/response/many-transactions.response.dto';
import { WalletTransaction } from './entity/wallet-transaction.entity';

describe('AppController', () => {
  let controller: AppController;
  let mockManyTransactionsResponse: ManyTransactionsResponseDto;
  let mockSingleTransactionResponse: CreateTransactionResponseDto;
  let transactionDto: CreateTransactionRequestDto;
  let mockTransaction: WalletTransaction;
  let customerTransactionDto: GetTransactionRequestDto;

  const mockAppService = {
    createNewTransaction: jest.fn(),
    getLastTransactions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);

    transactionDto = {
      customer_id: faker.datatype.uuid(),
      transaction_type: ETransactionType.IN,
      transaction_description: 'Unit test wallet',
      amount: faker.helpers.arrayElement([5000, 7500, 10000]),
    };

    mockTransaction = {
      ...transactionDto,
      transaction_id: faker.datatype.uuid(),
      transaction_time: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('newTransaction', () => {
    it('should response single response transaction just created', async () => {
      // arrange
      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      mockSingleTransactionResponse = new CreateTransactionResponseDto(
        HttpStatus.CREATED,
        `Create transaction successfully`,
        mockTransaction,
      );

      // act
      const response = await controller.newTransaction(transactionDto);

      // assert
      expect(response).toEqual(mockSingleTransactionResponse);
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateTransaction).toHaveBeenCalledWith(transactionDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException('error'));

      // act
      const newTransaction = controller.newTransaction(transactionDto);

      // assert
      await expect(newTransaction).rejects.toEqual(
        new InternalServerErrorException('error'),
      );
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateTransaction).toHaveBeenCalledWith(transactionDto);
    });
  });

  describe('retriveTransactions', () => {
    it('should response many transactions customer', async () => {
      // arrange
      customerTransactionDto = {
        customer_id: faker.datatype.uuid(),
        total: 9,
      };

      const mockResultLastTransactions = [
        {
          transaction_id: faker.datatype.uuid(),
          customer_id: customerTransactionDto.customer_id,
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

      const spyGetLastTransactions = jest
        .spyOn(mockAppService, 'getLastTransactions')
        .mockResolvedValue(mockResultLastTransactions);

      const listTransactions = new ManyTransactionsResponseDto(
        HttpStatus.OK,
        `Get data last transaction customer with ID ${customerTransactionDto.customer_id} successfully`,
        mockResultLastTransactions,
      );

      // act
      const response = await controller.retriveTransactions(
        customerTransactionDto,
      );

      // assert
      expect(response).toEqual(mockResultLastTransactions);
      expect(spyGetLastTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetLastTransactions).toHaveBeenCalledWith(
        customerTransactionDto,
      );
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      customerTransactionDto = {
        customer_id: faker.datatype.uuid(),
        total: 9,
      };

      const spyGetLastTransactions = jest
        .spyOn(mockAppService, 'getLastTransactions')
        .mockRejectedValue(new InternalServerErrorException('error'));

      // act
      const getCustomerById = controller.retriveTransactions(
        customerTransactionDto,
      );

      // assert
      await expect(getCustomerById).rejects.toEqual(
        new InternalServerErrorException('error'),
      );
      expect(spyGetLastTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetLastTransactions).toHaveBeenCalledWith(
        customerTransactionDto,
      );
    });
  });
});
