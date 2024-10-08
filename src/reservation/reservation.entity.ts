import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Client } from '../user/user.entity';
import { Car } from '../car/car.entity';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Reservation extends Document {
  @Prop({ required: true })
  dateDebut: string;

  @Prop({ required: true })
  dateFin: string;

  @Prop({ required: true })
  tarifTotale: number;

  @Prop({ required: true })
  chauffeur: boolean;

  @Prop({
    required: true,
    enum: ['payee', 'non payee', 'deleted','en attente'], 
    type: String,
    default: 'non payee',
  })
  statusPaiement: string;

  @Prop({ required: true })
  lieuRamassage: string;

  @Prop({ required: true })
  destination: string;


  @Prop()
  commentaire: string;

  @Prop({
    required: true,
    enum: ['confirmer', 'annuler', 'en Attent'],
    default: 'en Attent'
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  idClient: Client;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: true })
  idVoiture: Car;

  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
