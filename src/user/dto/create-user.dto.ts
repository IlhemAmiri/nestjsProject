import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre' })
  password: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  image: string;
}
