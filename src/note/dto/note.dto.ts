import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  @IsString()
  idClient: string;

  @IsNotEmpty()
  @IsString()
  idVoiture: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  note: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}

export class UpdateNoteDto {
  @IsNotEmpty()
  @IsString()
  readonly idClient?: string;
  @IsNotEmpty()
  @IsString()
  readonly idVoiture?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  note?: number;

  @IsOptional()
  @IsString()
  commentaire?: string;
}
