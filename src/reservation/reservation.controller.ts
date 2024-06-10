import { Controller, Get, Post, Body, Param, Delete, Patch, NotFoundException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }

  @Get()
  findAll(): Promise<Reservation[]> {
    return this.reservationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Reservation> {
    return this.reservationService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.reservationService.delete(id);
  }
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
    @Get(':idVoiture/reserved-periods')
    async getReservedDatePeriods(@Param('idVoiture') idVoiture: string) {
        return this.reservationService.getReservedDatePeriods(idVoiture);
    }
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
