import { ApiProperty } from '@nestjs/swagger';
import { WalletTransaction } from 'src/entity/wallet-transaction.entity';
import { BaseResponseDto } from './base.response.dto';

export class ResultTransactionsResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: WalletTransaction[]) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample get multi data successfully',
  })
  message: string;

  @ApiProperty({ type: WalletTransaction })
  data: WalletTransaction[];
}
