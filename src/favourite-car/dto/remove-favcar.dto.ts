import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveFavCarDto {
  @IsString()
  @IsNotEmpty()
  idClient: string;

  @IsString()
  @IsNotEmpty()
  idVoiture: string;
}
