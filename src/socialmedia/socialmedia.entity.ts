import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SocialMediaDocument = SocialMedia & Document;

@Schema()
export class SocialMedia {
  @Prop({ required: true })
  numTel: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  tempsDeTravail: string;

  @Prop()
  lienFacebook: string;

  @Prop()
  lienTwitter: string;

  @Prop()
  lienYoutube: string;

  @Prop()
  lienPinterest: string;

  @Prop()
  lienInstagram: string;

  @Prop()
  localisation: string;
}

export const SocialMediaSchema = SchemaFactory.createForClass(SocialMedia);
