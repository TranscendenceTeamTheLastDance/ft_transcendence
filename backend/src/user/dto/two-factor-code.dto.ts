import {IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}