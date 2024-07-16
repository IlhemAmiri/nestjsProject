import { IsNotEmpty, IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  idReservation: Types.ObjectId;

  @IsNotEmpty()
  @IsEnum(['cash', 'card'])
  methodePaiement: string;

  @IsNotEmpty()
  @IsEnum(['payee', 'non payee'])
  status: string;
  @IsOptional()
  @IsBoolean()
  confirmeParAdmin?: boolean;
}
