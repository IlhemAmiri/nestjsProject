import { IsString, IsNumber, IsBoolean, IsEnum, IsUrl, IsOptional } from 'class-validator';

export class CreateCarDto {
  @IsString()
  marque: string;

  @IsString()
  modele: string;

  @IsNumber()
  anneeFabrication: number;

  @IsEnum(['essence', 'diesel', 'hybride', 'electrique'])
  typeCarburant: string;

  @IsEnum(['manuelle', 'automatique'])
  typeTransmission: string;

  @IsEnum(['compacte', 'berline', 'SUV', 'monospace', 'cabriolet'])
  categorie: string;

  @IsEnum(['disponible', 'reserver', 'en entretien'])
  disponibilite: string;

  @IsNumber()
  kilometrage: number;

  @IsNumber()
  NbPlaces: number;

  @IsNumber()
  NbPortes: number;

  @IsBoolean()
  climatisation: boolean;

  @IsString()
  caracteristiques: string;

  @IsString()
  accessoiresOptionSupp: string;

  @IsNumber()
  prixParJ: number;

  @IsUrl()
  @IsOptional()
  image?: string;
  image2?: string;
  image3?: string;
  image4?: string;

  @IsString()
  @IsOptional()
  conditionDeLocation?: string;

  @IsNumber()
  @IsOptional()
  note?: number;

  @IsString()
  @IsOptional()
  commentaires?: string;

  @IsString()
  @IsOptional()
  offrePromotion?: string;
}
