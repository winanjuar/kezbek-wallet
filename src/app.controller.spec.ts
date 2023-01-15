import { faker } from '@faker-js/faker';
import {
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ETransactionType } from './core/type-transaction.enum';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { CreateTransactionResponseDto } from './dto/response/create-transaction.response.dto';
import { ResultBalanceHistoryResponseDto } from './dto/response/result-balance-history.response.dto';
import { ResultTransactionsResponseDto } from './dto/response/result-transactions.response.dto';
import { WalletBalanceActual } from './entity/wallet-balance-actual.entity';
import { WalletTransaction } from './entity/wallet-transaction.entity';

describe('AppController', () => {
  let controller: AppController;
  let transactionDto: CreateTransactionRequestDto;
  let getTransactionDto: GetTransactionRequestDto;

  let mockTransaction: WalletTransaction;
  let mockBalanceActual: WalletBalanceActual;

  let createTransactionResponse: CreateTransactionResponseDto;
  let resultTransactionResponse: ResultTransactionsResponseDto;
  let resultBalanceHistory: ResultBalanceHistoryResponseDto;

  const mockAppService = {
    createNewTransaction: jest.fn(),
    getBalanceActual: jest.fn(),
    getLastTransactions: jest.fn(),
    getLastBalanceHistory: jest.fn(),
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
        HttpStatus.CREATED,
        `Write transaction wallet successfully`,
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
        `Get last transactions successfully`,
        mockResultLastTransactions,
      );

      // act
      const response = await controller.retriveTransactions(getTransactionDto);

      // assert
      expect(response).toEqual(resultTransactionResponse);
      expect(spyGetLastTransactions).toHaveBeenCalledTimes(1);
      expect(spyGetLastTransactions).toHaveBeenCalledWith(getTransactionDto);
    });

    it('should throw data not found', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetLastTransactions = jest
        .spyOn(mockAppService, 'getLastTransactions')
        .mockRejectedValue(new NotFoundException());

      // act
      const retriveTransactions =
        controller.retriveTransactions(getTransactionDto);

      // assert
      await expect(retriveTransactions).rejects.toEqual(
        new NotFoundException(),
      );
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

  describe('retriveBalanceHistory', () => {
    it('should response many balance history customer', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
        total: 9,
      };

      const mockResultBalanceHistory = [
        {
          transaction_id: faker.datatype.uuid(),
          transaction_time: new Date(),
          customer_id: getTransactionDto.customer_id,
          balance: faker.datatype.number(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const spyGetLastBalanceHistory = jest
        .spyOn(mockAppService, 'getLastBalanceHistory')
        .mockResolvedValue(mockResultBalanceHistory);

      resultBalanceHistory = new ResultBalanceHistoryResponseDto(
        HttpStatus.OK,
        `Get last balance history successfully`,
        mockResultBalanceHistory,
      );

      // act
      const response = await controller.retriveBalanceHistory(
        getTransactionDto,
      );

      // assert
      expect(response).toEqual(resultBalanceHistory);
      expect(spyGetLastBalanceHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLastBalanceHistory).toHaveBeenCalledWith(getTransactionDto);
    });

    it('should throw data not found', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetLastBalanceHistory = jest
        .spyOn(mockAppService, 'getLastBalanceHistory')
        .mockRejectedValue(new NotFoundException());

      // act
      const funRetriveBalanceHistory =
        controller.retriveBalanceHistory(getTransactionDto);

      // assert
      await expect(funRetriveBalanceHistory).rejects.toEqual(
        new NotFoundException(),
      );
      expect(spyGetLastBalanceHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLastBalanceHistory).toHaveBeenCalledWith(getTransactionDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      getTransactionDto = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetLastBalanceHistory = jest
        .spyOn(mockAppService, 'getLastBalanceHistory')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funRetriveBalanceHistory =
        controller.retriveBalanceHistory(getTransactionDto);

      // assert
      await expect(funRetriveBalanceHistory).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetLastBalanceHistory).toHaveBeenCalledTimes(1);
      expect(spyGetLastBalanceHistory).toHaveBeenCalledWith(getTransactionDto);
    });
  });

  describe('handleInfoBalanceWallet', () => {
    it('should response current balance customer', async () => {
      // arrange
      const data = {
        customer_id: faker.datatype.uuid(),
      };

      mockBalanceActual = {
        customer_id: data.customer_id,
        last_transaction_id: faker.datatype.uuid(),
        last_transaction_time: new Date(),
        current_balance: faker.helpers.arrayElement([5000, 7500, 10000]),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const spyGetBalanceActual = jest
        .spyOn(mockAppService, 'getBalanceActual')
        .mockResolvedValue(mockBalanceActual);

      const mockResult = {
        customer_id: data.customer_id,
        current_balance: mockBalanceActual.current_balance,
      };

      // act
      const balance = await controller.handleInfoBalanceWallet(data);

      // assert
      expect(balance).toEqual(mockResult);
      expect(spyGetBalanceActual).toHaveBeenCalledTimes(1);
      expect(spyGetBalanceActual).toHaveBeenCalledWith(data.customer_id);
    });

    it('should return current balance 0 when does not have balance', async () => {
      // arrange
      const data = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetBalanceActual = jest
        .spyOn(mockAppService, 'getBalanceActual')
        .mockResolvedValue(null);

      const mockResult = {
        customer_id: data.customer_id,
        current_balance: 0,
      };

      // act
      const balance = await controller.handleInfoBalanceWallet(data);

      // assert
      expect(balance).toEqual(mockResult);
      expect(spyGetBalanceActual).toHaveBeenCalledTimes(1);
      expect(spyGetBalanceActual).toHaveBeenCalledWith(data.customer_id);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const data = {
        customer_id: faker.datatype.uuid(),
      };

      const spyGetBalanceActual = jest
        .spyOn(mockAppService, 'getBalanceActual')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funHandleInfoBalanceWallet =
        controller.handleInfoBalanceWallet(data);

      // assert
      await expect(funHandleInfoBalanceWallet).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGetBalanceActual).toHaveBeenCalledTimes(1);
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
