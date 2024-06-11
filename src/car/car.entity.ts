import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Car extends Document {
  
  @Prop({ required: true })
  marque: string;

  @Prop({ required: true })
  modele: string;

  @Prop({ required: true })
  anneeFabrication: number;

  @Prop({ 
    required: true, 
    enum: ['essence', 'diesel', 'hybride', 'electrique']
  })
  typeCarburant: string;

  @Prop({ 
    required: true, 
    enum: ['manuelle', 'automatique']
  })
  typeTransmission: string;

  @Prop({ 
    required: true, 
    enum: ['compacte', 'berline', 'SUV', 'monospace', 'cabriolet']
  })
  categorie: string;

  @Prop({ 
    required: true, 
    enum: ['disponible', 'reserver', 'en entretien'],
    default: 'disponible',
  })
  disponibilite: string;

  @Prop({ required: true })
  kilometrage: number;

  @Prop({ required: true })
  NbPlaces: number;

  @Prop({ required: true })
  NbPortes: number;

  @Prop({ required: true })
  climatisation: boolean;

  @Prop({ required: true })
  caracteristiques: string;

  @Prop({ required: true })
  accessoiresOptionSupp: string;

  @Prop({ required: true })
  prixParJ: number;

  @Prop()
  image: string;

  @Prop()
  conditionDeLocation: string;

  @Prop()
  note: number;

  @Prop()
  offrePromotion: string;
  
  @Prop({ type: Date, default: null })
  deleted_at: Date | null;
}

export const CarSchema = SchemaFactory.createForClass(Car);
