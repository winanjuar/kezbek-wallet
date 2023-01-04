import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateTransactionRequestDto } from './dto/request/create-transaction.request.dto';
import { GetTransactionRequestDto } from './dto/request/get-transaction.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { CreateTransactionResponseDto } from './dto/response/create-transaction.response.dto';
import { InternalServerErrorDto } from './dto/response/internal-server-error.response.dto';
import { ManyTransactionsResponseDto } from './dto/response/many-transactions.response.dto';
import { NotFoundResponseDto } from './dto/response/not-found.response.dto';

@ApiTags('Wallet')
@Controller({ version: '1' })
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: CreateTransactionRequestDto })
  @ApiCreatedResponse({ type: CreateTransactionResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
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
        HttpStatus.CREATED,
        `Create transaction successfully`,
        newTransaction,
      );
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOkResponse({ type: ManyTransactionsResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @HttpCode(200)
  @Post('customer')
  async retriveTransactions(@Body() transactionDto: GetTransactionRequestDto) {
    try {
      const transactions = await this.appService.getLastTransactions(
        transactionDto,
      );
      this.logger.log(
        `[POST, /customer] Retrive last transactions of customer ${transactionDto.customer_id} successfully`,
      );
      return transactions;
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException(error);
    }
  }
}
