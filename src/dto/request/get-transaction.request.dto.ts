import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive, IsUUID } from 'class-validator';

export class GetTransactionRequestDto {
  @ApiProperty()
  @IsUUID(4)
  customer_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPositive()
  total?: number;
}
