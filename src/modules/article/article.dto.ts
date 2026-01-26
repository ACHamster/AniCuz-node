import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  cover: string;

  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  boardId?: number; // 前端只传 ID，不传对象

  @IsArray()
  @IsString({ each: true }) // 假设前端传的是标签名数组 ["React", "Tech"]
  @IsOptional()
  tags?: string[];
}

export class EditArticleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  cover?: string;

  @IsNotEmpty()
  content?: string;

  @IsInt()
  @IsOptional()
  boardId?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class GetArticleListDto {
  @IsInt()
  @IsOptional()
  page?: number;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsInt()
  @IsOptional()
  authorId?: number;

  @IsInt()
  @IsOptional()
  boardId?: number;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  keyword?: string;

  @IsOptional()
  tag: string;
}

export class LikeOrFavoriteDto {
  articleId: number;
  userId: number;
}

export class UpdateArticleStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'DRAFT' | 'PUBLISHED';
}
