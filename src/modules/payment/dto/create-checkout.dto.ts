import { IsNumber, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Số tiền USDC muốn nạp (đơn vị: cents)' })
  @IsNumber()
  @Min(100) // Tối thiểu $1.00
  amount: number;

  @ApiProperty({ description: 'URL redirect khi thanh toán thành công' })
  @IsString()
  successUrl: string;

  @ApiProperty({ description: 'URL redirect khi hủy thanh toán' })
  @IsString()
  cancelUrl: string;
}
