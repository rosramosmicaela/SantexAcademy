import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}