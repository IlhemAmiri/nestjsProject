import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Car } from '../car/car.entity';
import { Client } from '../user/user.entity';
import * as moment from 'moment';

@Injectable()
export class ReservationService {
    constructor(
        @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
        @InjectModel(Car.name) private carModel: Model<Car>,
        @InjectModel(Client.name) private clientModel: Model<Client>,
    ) { }

    async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
        const now = new Date();
        const car = await this.carModel.findById(createReservationDto.idVoiture).exec();
        if (!car || car.deleted_at !== null) {
            throw new NotFoundException('Car not found');
        }
        const client = await this.clientModel.findById(createReservationDto.idClient).exec();
        if (!client || client.deleted_at !== null) {
            throw new NotFoundException('Client not found');
        }
        // Vérifier la date d'expiration du permis
        const dateExpirationPermis = new Date(client.dateExpirationPermis);
        if (dateExpirationPermis < now) {
            throw new BadRequestException('The client\'s driving license has expired');
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
        return this.reservationModel.find({ deleted_at: null }).populate('idClient').populate('idVoiture').exec();
    }

    async findOne(id: string): Promise<Reservation> {
        const reservation = await this.reservationModel.findById({ _id: id, deleted_at: null }).populate('idClient').populate('idVoiture').exec();
        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }
        return reservation;
    }

    async delete(id: string): Promise<void> {
        const result = await this.reservationModel.findByIdAndUpdate(
            id,
            { deleted_at: new Date(), status: 'annuler' },
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
        // Check if the reservation is not deleted and the payment status is not "payee"
        if (reservation.deleted_at !== null || reservation.statusPaiement === 'payee') {
            throw new BadRequestException('Cannot update reservation status');
        }
        if (status === 'confirmer') {
            const car = await this.carModel.findById(reservation.idVoiture).exec();
            if (!car) {
                throw new NotFoundException('Car not found');
            }
            const client = await this.clientModel.findById(reservation.idClient).exec();
            if (!client) {
                throw new NotFoundException('Client not found');
            }

            // Vérifier la date d'expiration du permis
            const now = new Date();
            const dateExpirationPermis = new Date(client.dateExpirationPermis);
            if (dateExpirationPermis < now) {
                throw new BadRequestException('The client\'s driving license has expired');
            }

            const overlappingReservation = await this.reservationModel.findOne({
                idVoiture: reservation.idVoiture,
                status: 'confirmer',
                _id: { $ne: reservation._id }, // Exclude the current reservation
                $or: [
                    { dateDebut: { $lt: reservation.dateFin }, dateFin: { $gt: reservation.dateDebut } },
                    { dateDebut: { $gte: reservation.dateDebut, $lt: reservation.dateFin } }
                ]
            }).exec();

            if (overlappingReservation) {
                throw new BadRequestException('Updating status results in overlapping reservation periods');
            }

            car.disponibilite = 'reserver';
            await car.save();

            // Annuler les réservations en attente chevauchant cette période
            await this.reservationModel.updateMany({
                idVoiture: reservation.idVoiture,
                status: 'en Attent',
                $or: [
                    { dateDebut: { $lt: reservation.dateFin }, dateFin: { $gt: reservation.dateDebut } },
                    { dateDebut: { $gte: reservation.dateDebut, $lt: reservation.dateFin } }
                ]
            }, {
                $set: { status: 'annuler' }
            }).exec();
        }

        // Update only the status field
        reservation.status = status;
        return reservation.save({ validateBeforeSave: false });
    }

    async getReservedDatePeriods(idVoiture: string): Promise<{ dateDebut: Date, dateFin: Date }[]> {
        const now = new Date();
        const reservations = await this.reservationModel.find({
            idVoiture: idVoiture,
            status: 'confirmer',
            deleted_at: null,
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
        const reservations = await this.reservationModel.find({ idClient: clientId, deleted_at: null }).populate('idVoiture').exec();
        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('Reservations for this client not found');
        }
        return reservations;
    }

    async getReservationByIdCar(carId: string): Promise<Reservation[]> {
        const reservations = await this.reservationModel.find({ idVoiture: carId, deleted_at: null }).populate('idClient').populate('idVoiture').exec();
        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('Reservations for this car not found');
        }
        return reservations;
    }
    // Function to get the most reserved car
    async getTopReservedCar(): Promise<Car> {
        const reservations = await this.reservationModel.aggregate([
            { $match: { deleted_at: null } },
            { $group: { _id: '$idVoiture', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'car'
                }
            },
            { $unwind: '$car' },
            {
                $project: {
                    _id: 0,
                    car: 1
                }
            }
        ]).exec();

        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('No reservations found');
        }

        return reservations[0].car;
    }

    async getTopThreeReservedCars(): Promise<Car[]> {
        const reservations = await this.reservationModel.aggregate([
            { $match: { deleted_at: null } },
            { $group: { _id: '$idVoiture', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'car'
                }
            },
            { $unwind: '$car' },
            {
                $project: {
                    _id: 0,
                    car: 1
                }
            }
        ]).exec();

        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('No reservations found');
        }

        return reservations.map(reservation => reservation.car);
    }
    async getTopReservedCarOfMonth(): Promise<Car> {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Les mois sont de 0 à 11 en JavaScript
        const currentYear = currentDate.getFullYear();
    
        const reservations = await this.reservationModel.aggregate([
            {
                $match: {
                    deleted_at: null,
                    $expr: {
                        $and: [
                            { $eq: [{ $month: { $toDate: '$dateDebut' } }, currentMonth] },
                            { $eq: [{ $year: { $toDate: '$dateDebut' } }, currentYear] },
                        ]
                    }
                }
            },
            { $group: { _id: '$idVoiture', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 },
            {
                $lookup: {
                    from: 'cars',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'car'
                }
            },
            { $unwind: '$car' },
            {
                $project: {
                    _id: 0,
                    car: 1
                }
            }
        ]).exec();
    
        if (!reservations || reservations.length === 0) {
            throw new NotFoundException('No reservations found for the current month');
        }
    
        return reservations[0].car;
    }
    
}
