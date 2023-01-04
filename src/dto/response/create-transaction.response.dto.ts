import { ApiProperty } from '@nestjs/swagger';
import { WalletDto } from '../request/wallet.dto';
import { BaseResponseDto } from './base.response.dto';

export class CreateTransactionResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: WalletDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Create new transaction successfully' })
  message: string;

  @ApiProperty({ type: WalletDto })
  data: WalletDto;
}
