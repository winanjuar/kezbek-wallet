import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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
  @Post()
  async newTransaction(@Body() transactionDto: CreateTransactionRequestDto) {
    try {
      const newTransaction = await this.appService.createNewTransaction(
        transactionDto,
      );
      this.logger.log(
        `[POST, /] Write transaction ${newTransaction.transaction_id} of customer ${newTransaction.customer_id} successfully`,
      );

      return new CreateTransactionResponseDto(
        HttpStatus.OK,
        `Create transaction successfully`,
        newTransaction,
      );
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: ResultTransactionsResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('last-transaction')
  async retriveTransactions(@Body() transactionDto: GetTransactionRequestDto) {
    try {
      const transactions = await this.appService.getLastTransactions(
        transactionDto,
      );
      this.logger.log(
        `[POST, /last-transaction] Retrive last transactions of customer ${transactionDto.customer_id} successfully`,
      );
      return new ResultTransactionsResponseDto(
        HttpStatus.OK,
        `Get data last transaction customer with ID ${transactionDto.customer_id} successfully`,
        transactions,
      );
    } catch (error) {
      this.logger.log(`[POST, /last-transaction] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @EventPattern('ep_write_wallet')
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
        `[EventPattern ep_write_wallet] [${wallet.transaction_id}] Write wallet successfully`,
      );
    } catch (error) {
      this.logger.log(`[EventPattern ep_write_wallet] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
