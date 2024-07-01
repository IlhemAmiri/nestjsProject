import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema()
export class Faq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
