import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Client } from '../user/user.entity';
import { Car } from '../car/car.entity';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Note extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  idClient: Client;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: true })
  idVoiture: Car;

  @Prop({ required: true, min: 1, max: 5 })
  note: number;

  @Prop()
  commentaire: string;
  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
