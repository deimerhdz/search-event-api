import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchEventDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topK?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  scoreThreshold?: number;
}

export class EventResponseDto {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  price: number;
  isIndexed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchResultItemDto extends EventResponseDto {
  score: number;
}

export class SearchResponseDto {
  results: SearchResultItemDto[];
  total: number;
  query: string;
}
