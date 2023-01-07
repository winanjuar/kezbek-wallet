import { faker } from '@faker-js/faker';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ETransactionType } from './core/type-transaction.enum';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { CreateTransactionResponseDto } from './dto/response/create-transaction.response.dto';
import { ResultTransactionsResponseDto } from './dto/response/result-transactions.response.dto';
import { WalletTransaction } from './entity/wallet-transaction.entity';

describe('AppController', () => {
  let controller: AppController;
  let transactionDto: CreateTransactionRequestDto;
  let getTransactionDto: GetTransactionRequestDto;

  let mockTransaction: WalletTransaction;

  let createTransactionResponse: CreateTransactionResponseDto;
  let resultTransactionResponse: ResultTransactionsResponseDto;

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
  });

  afterEach(() => jest.clearAllMocks());

  describe('newTransaction', () => {
    beforeEach(async () => {
      transactionDto = {
        transaction_id: faker.datatype.uuid(),
        customer_id: faker.datatype.uuid(),
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
    });

    it('should response single response transaction just created', async () => {
      // arrange
      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      createTransactionResponse = new CreateTransactionResponseDto(
        HttpStatus.OK,
        `Create transaction successfully`,
        mockTransaction,
      );

      // act
      const response = await controller.newTransaction(transactionDto);

      // assert
      expect(response).toEqual(createTransactionResponse);
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateTransaction).toHaveBeenCalledWith(transactionDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const newTransaction = controller.newTransaction(transactionDto);

      // assert
      await expect(newTransaction).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateTransaction).toHaveBeenCalledWith(transactionDto);
    });
  });

  describe('retriveTransactions', () => {
    it('should response many transactions customer', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
        total: 9,
      };

      const mockResultLastTransactions = [
        {
          transaction_id: faker.datatype.uuid(),
          customer_id: getTransactionDto.customer_id,
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

      resultTransactionResponse = new ResultTransactionsResponseDto(
        HttpStatus.OK,
        `Get data last transaction customer with ID ${getTransactionDto.customer_id} successfully`,
        mockResultLastTransactions,
      );

      // act
      const response = await controller.retriveTransactions(getTransactionDto);

      // assert
      expect(response).toEqual(resultTransactionResponse);
      expect(spyGetLastTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetLastTransactions).toHaveBeenCalledWith(getTransactionDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetLastTransactions = jest
        .spyOn(mockAppService, 'getLastTransactions')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const retriveTransactions =
        controller.retriveTransactions(getTransactionDto);

      // assert
      await expect(retriveTransactions).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetLastTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetLastTransactions).toHaveBeenCalledWith(getTransactionDto);
    });
  });

  describe('handleWriteWallet', () => {
    it('should response single response transaction just created', async () => {
      // arrange
      const data = {
        transaction_id: faker.datatype.uuid(),
        customer_id: faker.datatype.uuid(),
        transaction_time: new Date(),
        transaction_type: ETransactionType.IN,
        transaction_description: 'KezBekPoint',
        amount: faker.helpers.arrayElement([5000, 7500, 10000]),
      };

      mockTransaction = {
        ...transactionDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockResolvedValue(mockTransaction);

      // act
      await controller.handleWriteWallet(data);

      // assert
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateTransaction).toHaveBeenCalledWith(data);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const spyCreateTransaction = jest
        .spyOn(mockAppService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const handleWriteWallet = controller.handleWriteWallet(transactionDto);

      // assert
      await expect(handleWriteWallet).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateTransaction).toHaveBeenCalledTimes(1);
    });
  });
});
