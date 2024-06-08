import { IsBoolean, IsNotEmpty, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateReservationDto {
    @IsDateString()
    @IsNotEmpty()
    @IsFutureDate({ message: 'dateDebut must be a future date' })
    dateDebut: string;

    @IsDateString()
    @IsNotEmpty()
    @IsFutureDate({ message: 'dateFin must be a future date' })
    dateFin: string;

    @IsNumber()
    @IsNotEmpty()
    tarifTotale: number;

    @IsBoolean()
    @IsNotEmpty()
    chauffeur: boolean;

    @IsEnum(['cash', 'card'])
    @IsNotEmpty()
    methodePaiement: string;

    @IsString()
    commentaire?: string;

    @IsEnum(['confirmer', 'annuler', 'en Attent'])
    @IsNotEmpty()
    status: string;

    @IsNotEmpty()
    idClient: string;

    @IsNotEmpty()
    idVoiture: string;
}
