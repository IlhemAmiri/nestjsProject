import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Client)
    @Post()
    create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
        return this.reservationService.create(createReservationDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get()
    findAll(): Promise<Reservation[]> {
        return this.reservationService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Reservation> {
        return this.reservationService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<string> {
        await this.reservationService.delete(id);
        return `La reservation avec l'identifiant ${id} a été supprimée`;
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Patch(':id/status')
    async updateReservationStatus(
        @Param('id') id: string,
        @Body('status') status: string
    ) {
        return this.reservationService.updateReservationStatus(id, status);
    }

    // @Get(':idVoiture/disponibilite')
    // async getAvailableDatePeriods(@Param('idVoiture') idVoiture: string): Promise<{ dateDebut: Date, dateFin: Date }[]> {
    //     return this.reservationService.getAvailableDatePeriods(idVoiture);
    // }

    @UseGuards(JwtAuthGuard)
    @Get(':idVoiture/reserved-periods')
    async getReservedDatePeriods(@Param('idVoiture') idVoiture: string) {
        return this.reservationService.getReservedDatePeriods(idVoiture);
    }

    @UseGuards(JwtAuthGuard)
    @Get('client/:clientId')
    async getReservationsByClientId(@Param('clientId') clientId: string): Promise<Reservation[]> {
        try {
            return await this.reservationService.getReservationByIdClient(clientId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('car/:carId')
    async getReservationsByCarId(@Param('carId') carId: string): Promise<Reservation[]> {
        try {
            return await this.reservationService.getReservationByIdCar(carId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}
