import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.entity';
import { Reservation, ReservationSchema } from '../reservation/reservation.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Reservation.name, schema: ReservationSchema },
        { name: Payment.name, schema: PaymentSchema },
      ]),
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService],
  })
  export class PaymentModule {}