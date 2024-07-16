import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    resetToken: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
