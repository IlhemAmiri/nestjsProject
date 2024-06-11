import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Car } from '../car/car.entity';

@Injectable()
export class ReservationService {
    constructor(
        @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
        @InjectModel(Car.name) private carModel: Model<Car>,
    ) { }

    async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
        const now = new Date();
        const car = await this.carModel.findById(createReservationDto.idVoiture).exec();
        if (!car) {
            throw new NotFoundException('Car not found');
        }
    
        const overlappingReservation = await this.reservationModel.findOne({
            idVoiture: createReservationDto.idVoiture,
            status: 'confirmer', // Rechercher uniquement les réservations confirmées
            $or: [
                { dateDebut: { $lt: createReservationDto.dateFin }, dateFin: { $gt: createReservationDto.dateDebut } },
                { dateDebut: { $gte: createReservationDto.dateDebut, $lt: createReservationDto.dateFin } }
            ]
        }).exec();
    
        if (overlappingReservation) {
            throw new BadRequestException('Start date is within another confirmed reservation period');
        }
    
        const dateDebut = new Date(createReservationDto.dateDebut);
        const dateFin = new Date(createReservationDto.dateFin);
        if (dateDebut >= dateFin) {
            throw new BadRequestException('Start date must be before end date');
        }
        if (dateDebut <= now || dateFin <= now) {
            throw new BadRequestException('Dates must be in the future');
        }
        const duration = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 3600 * 24));
        const tarifTotale = car.prixParJ * duration;
    
        const reservation = new this.reservationModel({
            ...createReservationDto,
            tarifTotale,
        });
    
        if (createReservationDto.status === 'confirmer') {
            car.disponibilite = 'reserver';
            await car.save();
        }
    
        return reservation.save();
    }
    

    async findAll(): Promise<Reservation[]> {
        return this.reservationModel.find().populate('idClient').populate('idVoiture').exec();
    }

    async findOne(id: string): Promise<Reservation> {
        const reservation = await this.reservationModel.findById(id).populate('idClient').populate('idVoiture').exec();
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }
        return reservation;
    }

    async delete(id: string): Promise<void> {
        const result = await this.reservationModel.findByIdAndUpdate(
          id,
          { deleted_at: new Date() },
          { new: true }
        ).exec();
    
        if (!result) {
          throw new NotFoundException('Reservation not found');
        }
      }
    async updateReservationStatus(id: string, status: string): Promise<Reservation> {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }
    
        if (status === 'confirmer') {
            const car = await this.carModel.findById(reservation.idVoiture).exec();
            if (!car) {
                throw new NotFoundException('Car not found');
            }
            // if (car.disponibilite !== 'disponible') {
            //     throw new BadRequestException('Car is not available');
            // }
            // Vérifier les conflits de dates uniquement si la réservation est confirmée
            const overlappingReservation = await this.reservationModel.findOne({
                idVoiture: reservation.idVoiture,
                status: 'confirmer',
                $and: [
                    { _id: { $ne: reservation._id } }, // Exclure la réservation actuelle
                    {
                        $or: [
                            { dateDebut: { $lt: reservation.dateFin }, dateFin: { $gt: reservation.dateDebut } },
                            { dateDebut: { $gte: reservation.dateDebut, $lt: reservation.dateFin } }
                        ]
                    }
                ]
            }).exec();
    
            if (overlappingReservation) {
                throw new BadRequestException('Updating status results in overlapping reservation periods');
            }
            // const overlappingReservations = await this.reservationModel.find({
            //     idVoiture: reservation.idVoiture,
            //     status: { $in: ['en attente', 'confirmer'] },
            //     $and: [
            //         { _id: { $ne: reservation._id } }, // Exclude the current reservation
            //         {
            //             $or: [
            //                 { dateDebut: { $lt: reservation.dateFin }, dateFin: { $gt: reservation.dateDebut } },
            //                 { dateDebut: { $gte: reservation.dateDebut, $lt: reservation.dateFin } }
            //             ]
            //         }
            //     ]
            // }).exec();
    
            // // Cancel overlapping reservations
            // await Promise.all(overlappingReservations.map(async (overlap) => {
            //     overlap.status = 'annuler';
            //     await overlap.save();
            // }));
    
            car.disponibilite = 'reserver';
            await car.save();
        }
    
        reservation.status = status;
        return reservation.save();
    }
    // async getAvailableDatePeriods(idVoiture: string, limit: number = 3): Promise<{ dateDebut: Date, dateFin: Date }[]> {
    //     const now = new Date();
    //     const reservations = await this.reservationModel.find({
    //         idVoiture: idVoiture,
    //         status: 'confirmer', // Seules les réservations confirmées sont prises en compte
    //         dateFin: { $gte: now } // Seules les réservations dont la date de fin est après la date actuelle sont prises en compte
    //     }).sort({ dateFin: 1 }).limit(limit).exec();
    
    //     const availablePeriods: { dateDebut: Date, dateFin: Date }[] = [];
    
    //     if (reservations.length === 0) {
    //         // S'il n'y a pas de réservations futures, retourner trois périodes de dates à partir de maintenant
    //         for (let i = 0; i < limit; i++) {
    //             const nextDateDebut = new Date();
    //             nextDateDebut.setDate(now.getDate() + i);
    //             const nextDateFin = new Date(nextDateDebut);
    //             nextDateFin.setDate(nextDateDebut.getDate() + 1); // Durée d'une journée par défaut
    //             availablePeriods.push({ dateDebut: nextDateDebut, dateFin: nextDateFin });
    //         }
    //     } else {
    //         // Calculer trois périodes de dates disponibles entre la fin de la dernière réservation et le début de la prochaine
    //         for (let i = 0; i < reservations.length - 1 && availablePeriods.length < limit; i++) {
    //             const endDate = new Date(reservations[i].dateFin);
    //             const nextDateDebut = new Date(reservations[i + 1].dateDebut);
    //             const daysDiff = Math.ceil((nextDateDebut.getTime() - endDate.getTime()) / (1000 * 3600 * 24));
    
    //             // Ajouter les périodes de dates disponibles entre les réservations à la liste
    //             for (let j = 1; j <= daysDiff && availablePeriods.length < limit; j++) {
    //                 const dateDebut = new Date(endDate);
    //                 dateDebut.setDate(endDate.getDate() + j);
    //                 const dateFin = new Date(dateDebut);
    //                 dateFin.setDate(dateDebut.getDate() + 1); // Durée d'une journée par défaut
    //                 availablePeriods.push({ dateDebut, dateFin });
    //             }
    //         }
    //     }
    
    //     return availablePeriods;
    // }
    async getReservedDatePeriods(idVoiture: string): Promise<{ dateDebut: Date, dateFin: Date }[]> {
        const now = new Date();
        const reservations = await this.reservationModel.find({
            idVoiture: idVoiture,
            status: 'confirmer', 
        }).sort({ dateDebut: 1 }).exec();
    
        const reservedPeriods: { dateDebut: Date, dateFin: Date }[] = [];
    
        for (const reservation of reservations) {
            const dateDebut = new Date(reservation.dateDebut);
            const dateFin = new Date(reservation.dateFin);
            
            if (dateDebut >= now && dateFin >= now) {
                reservedPeriods.push({
                    dateDebut: dateDebut,
                    dateFin: dateFin
                });
            }
        }
    
        return reservedPeriods;
    }
    async getReservationByIdClient(clientId: string): Promise<Reservation[]> {
        const reservations = await this.reservationModel.find({ idClient: clientId }).exec();
        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('Reservations for this client not found');
        }
        return reservations;
    }

    async getReservationByIdCar(carId: string): Promise<Reservation[]> {
        const reservations = await this.reservationModel.find({ idVoiture: carId }).exec();
        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('Reservations for this car not found');
        }
        return reservations;
    }
    
}
