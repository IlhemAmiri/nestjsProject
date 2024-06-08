import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
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
}
