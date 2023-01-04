import { ApiProperty } from '@nestjs/swagger';
import { WalletDto } from '../request/wallet.dto';
import { BaseResponseDto } from './base.response.dto';

export class ManyTransactionsResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: WalletDto[]) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example:
      'Get data customer with ID 67746a2b-d693-47e1-99f5-f44572aee307 successfully',
  })
  message: string;

  @ApiProperty({ type: WalletDto })
  data: WalletDto[];
}
