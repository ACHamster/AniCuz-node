import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';

export enum ItemType {
  BACKGROUND = 'BACKGROUND',
  FRAME = 'FRAME',
  BADGE = 'BADGE',
}

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  image: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsEnum(ItemType)
  type: ItemType;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;
}

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(ItemType)
  @IsOptional()
  type?: ItemType;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;
}
