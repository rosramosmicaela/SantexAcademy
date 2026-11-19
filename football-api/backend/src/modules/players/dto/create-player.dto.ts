import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsString()
  club?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsInt()
  @Min(1)
  @Max(99)
  rating: number;

  @IsOptional() @IsInt() @Min(0) @Max(99) speed?: number;
  @IsOptional() @IsInt() @Min(0) @Max(99) shooting?: number;
  @IsOptional() @IsInt() @Min(0) @Max(99) dribbling?: number;
  @IsOptional() @IsInt() @Min(0) @Max(99) passing?: number;
  @IsOptional() @IsInt() @Min(0) @Max(99) defending?: number;
  @IsOptional() @IsInt() @Min(0) @Max(99) physic?: number;
}