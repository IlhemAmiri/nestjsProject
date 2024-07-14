import { IsNotEmpty } from 'class-validator';

export class CompleteRegistrationDto {
  @IsNotEmpty()
  cin: string;

  @IsNotEmpty()
  passport: string;

  @IsNotEmpty()
  dateExpirationPermis: string;

  @IsNotEmpty()
  numPermisConduire: string;

  @IsNotEmpty()
  dateNaissance: string;

  @IsNotEmpty()
  numTel: string;

  @IsNotEmpty()
  adresse: string;
}
