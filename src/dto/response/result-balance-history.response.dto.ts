import { ApiProperty } from '@nestjs/swagger';
import { WalletBalanceHistory } from 'src/entity/wallet-balance-history.entity';
import { BaseResponseDto } from './base.response.dto';

export class ResultBalanceHistoryResponseDto extends BaseResponseDto {
  constructor(
    statusCode: number,
    message: string,
    data: WalletBalanceHistory[],
  ) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample get multi data successfully',
  })
  message: string;

  @ApiProperty({ type: WalletBalanceHistory })
  data: WalletBalanceHistory[];
}
