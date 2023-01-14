import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';

import { CreateTransactionResponseDto } from './dto/response/create-transaction.response.dto';
import { ResultTransactionsResponseDto } from './dto/response/result-transactions.response.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { NotFoundResponseDto } from './dto/response/not-found.response.dto';
import { IWalletData } from './core/wallet-data.interface';
import { ETransactionType } from './core/type-transaction.enum';
import { EPatternMessage } from './core/pattern-message.enum';
import { IResponseBalanceActual } from './core/response-info-balace-actual.interface';
import { IRequestIdCustomer } from './core/request-id-customer.interface';
import { ResultBalanceHistoryResponseDto } from './dto/response/result-balance-history.response.dto';

@ApiTags('Wallet')
@Controller({ version: '1' })
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: CreateTransactionRequestDto })
  @ApiOkResponse({ type: CreateTransactionResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('try-new-transaction')
  async newTransaction(@Body() transactionDto: CreateTransactionRequestDto) {
    const logIdentifier = 'POST try-new-transaction';
    try {
      const newTransaction = await this.appService.createNewTransaction(
        transactionDto,
      );
      this.logger.log(
        `[${logIdentifier}] [${newTransaction.transaction_id}] Write transaction wallet successfully`,
      );

      return new CreateTransactionResponseDto(
        HttpStatus.OK,
        `Write transaction wallet successfully`,
        newTransaction,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: ResultTransactionsResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('try-get-last-transaction')
  async retriveTransactions(@Body() transactionDto: GetTransactionRequestDto) {
    const logIdentifier = 'POST try-get-last-transaction';
    try {
      const transactions = await this.appService.getLastTransactions(
        transactionDto,
      );
      this.logger.log(
        `[${logIdentifier}] [${transactionDto.customer_id}] Get last transactions successfully`,
      );
      return new ResultTransactionsResponseDto(
        HttpStatus.OK,
        `Get last transactions successfully`,
        transactions,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: ResultTransactionsResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('try-get-last-balance-history')
  async retriveBalanceHistory(
    @Body() transactionDto: GetTransactionRequestDto,
  ) {
    const logIdentifier = 'POST try-get-last-balance-history';
    try {
      const balanceHistory = await this.appService.getLastBalanceHistory(
        transactionDto,
      );
      this.logger.log(
        `[${logIdentifier}] [${transactionDto.customer_id}] Get last balance history successfully`,
      );
      return new ResultBalanceHistoryResponseDto(
        HttpStatus.OK,
        `Get last balance history successfully`,
        balanceHistory,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern(EPatternMessage.INFO_BALANCE_WALLET)
  async handleInfoBalanceWallet(@Payload() data: IRequestIdCustomer) {
    try {
      const customer_id = data.customer_id;
      const balance = await this.appService.getBalanceActual(customer_id);
      this.logger.log(
        `[${EPatternMessage.INFO_BALANCE_WALLET}] [${customer_id}] Get current balance successfully`,
      );
      if (!balance) {
        return {
          customer_id,
          current_balance: 0,
        } as IResponseBalanceActual;
      }
      return {
        customer_id,
        current_balance: balance.current_balance,
      } as IResponseBalanceActual;
    } catch (error) {
      this.logger.log(`[${EPatternMessage.INFO_BALANCE_WALLET}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @EventPattern(EPatternMessage.WRITE_WALLET)
  async handleWriteWallet(@Payload() data: IWalletData) {
    try {
      const transactionDto: CreateTransactionRequestDto = {
        transaction_id: data.transaction_id,
        customer_id: data.customer_id,
        transaction_time: data.transaction_time,
        transaction_type: ETransactionType.IN,
        transaction_description: 'KezBekPoint',
        amount: data.amount,
      };
      const wallet = await this.appService.createNewTransaction(transactionDto);
      this.logger.log(
        `[${EPatternMessage.WRITE_WALLET}] [${wallet.transaction_id}] Write wallet successfully`,
      );
    } catch (error) {
      this.logger.log(`[${EPatternMessage.WRITE_WALLET}] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
