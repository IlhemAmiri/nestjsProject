import { IsOptional, IsString } from 'class-validator';

export class SearchCarDto {
  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  modele?: string;

  @IsOptional()
  @IsString()
  caracteristique?: string;
}
