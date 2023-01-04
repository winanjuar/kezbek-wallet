import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from './base.response.dto';

export class NotFoundResponseDto extends BaseResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({
    example: `Customer with id 67746a2b-d693-47e1-99f5-f44572aee306 doesn't exist`,
  })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error: string;
}
