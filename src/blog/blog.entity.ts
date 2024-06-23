import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Blog extends Document {
  
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: 'Admin' })
  author: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  summary: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);