import { IsOptional, IsEnum, IsNumber, IsString, Min, Max } from 'class-validator';

export class RechercheCarDto {
  @IsOptional()
  @IsEnum(['Car', 'Van', 'Minibus', 'Prestige'])
  vehicleType?: string;

  @IsOptional()
  @IsEnum(['Compact', 'Sedan', 'SUV', 'Minivan', 'Convertible', 'Coupe', 'Exotic Cars', 'Hatchback', 'Truck', 'Sports Car', 'Station Wagon'])
  bodyType?: string;

  @IsOptional()
  @IsEnum(['2 seats', '4 seats', '6 seats', '6+ seats'])
  seats?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(195)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(195)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
