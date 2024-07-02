import { IsString, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  text?: string;
}

export class UpdateBlogDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentDto)
  @IsOptional()
  content?: ContentDto[];
}
