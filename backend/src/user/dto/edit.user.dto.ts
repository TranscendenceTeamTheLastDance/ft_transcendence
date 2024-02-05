import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class EditUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  twoFactorSecret?: string;

  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;
}
