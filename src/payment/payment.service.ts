import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Reservation } from '../reservation/reservation.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const reservation = await this.reservationModel.findById(createPaymentDto.idReservation).exec();
    if (!reservation || reservation.deleted_at !== null) {
      throw new NotFoundException(`Reservation with ID ${createPaymentDto.idReservation} not found`);
    }
    if (reservation.status !== 'confirmer') {
      throw new BadRequestException(`Reservation with ID ${createPaymentDto.idReservation} is not confirmed and cannot be paid for.`);
    }

    const newPayment = new this.paymentModel(createPaymentDto);
    await newPayment.save();

    // Update the reservation statusPaiement to 'payee'
    reservation.statusPaiement = 'en attente';
    await reservation.save();
   
    return newPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find({ status: { $ne: 'deleted' } }).populate('idReservation').exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ _id: id, status: { $ne: 'deleted' } }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const existingPayment = await this.paymentModel.findOneAndUpdate(
      { _id: id, deleted_at: null },
      updatePaymentDto,
      { new: true }
    ).exec();
    if (!existingPayment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return existingPayment;
  }

  async remove(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findOneAndUpdate(
      { _id: id, status: { $ne: 'deleted' } },
      { status: 'deleted' },
      { new: true }
    ).exec();
    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }
    return payment;
  }


  async confirmPayment(id: string, confirmeParAdmin: boolean): Promise<Payment> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment #${id} not found`);
    }

    if (payment.methodePaiement !== 'cash') {
      throw new BadRequestException(`Payment #${id} is not a cash payment and cannot be confirmed by admin.`);
    }

    payment.confirmeParAdmin = confirmeParAdmin;

    if (confirmeParAdmin) {
      const reservation = await this.reservationModel.findById(payment.idReservation).exec();
      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${payment.idReservation} not found`);
      }
      reservation.statusPaiement = 'payee';
      await reservation.save();
    }

    await payment.save();

    return payment;
  }
}
