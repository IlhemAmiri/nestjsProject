import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reservation } from '../reservation/reservation.entity';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Payment extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: true })
  idReservation: Reservation;

  @Prop({
    required: true,
    enum: ['cash', 'card'],
    type: String
  })
  methodePaiement: string;

  @Prop({
    required: true,
    enum: ['payee', 'non payee', 'deleted'], 
    type: String,
    default: 'non payee',
  })
  status: string;
  
  @Prop({
    type: Boolean,
    default: false,
  })
  confirmeParAdmin: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
