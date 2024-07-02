import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class ContentDto {
  @IsString()
  title: string;

  @IsString()
  text: string;
}

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsDateString()
  @IsNotEmpty()
  date: Date;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentDto)
  content: ContentDto[];
}
