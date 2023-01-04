import { ApiProperty } from '@nestjs/swagger';
import { WalletTransaction } from 'src/entity/wallet-transaction.entity';
import { WalletDto } from '../request/wallet.dto';
import { BaseResponseDto } from './base.response.dto';

export class CreateTransactionResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: WalletTransaction) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Create new transaction successfully' })
  message: string;

  @ApiProperty({ type: WalletTransaction })
  data: WalletTransaction;
}
