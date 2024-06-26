import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Client } from '../user/user.entity';
import { Car } from '../car/car.entity';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class FavouriteCar extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  idClient: Client;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: true })
  idVoiture: Car;
  
  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}


export const FavouriteCarSchema = SchemaFactory.createForClass(FavouriteCar);
