import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  price: number;
}
