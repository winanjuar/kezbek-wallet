import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { ETransactionType } from 'src/core/type-transaction.enum';

export class CreateTransactionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  customer_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ETransactionType)
  transaction_type: ETransactionType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transaction_description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
