import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFavCarDto {
  @IsString()
  @IsNotEmpty()
  idClient: string;

  @IsString()
  @IsNotEmpty()
  idVoiture: string;
}
