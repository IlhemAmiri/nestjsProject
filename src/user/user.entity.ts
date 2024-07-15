import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  discriminatorKey: 'role'
})

export class User extends Document {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prenom: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;

@Prop({
  required: true,
  default: 'admin',
  enum: ['admin', 'client'],
  type: String
})
role: string;

@Prop()
image: string;

@Prop({ type: Date, default: null })
deleted_at: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Client extends User {


  @Prop({ unique: true })
  CIN: string;

  @Prop({ unique: true })
  passport: string;

  @Prop()
  adresse: string;

  @Prop()
  numTel: string;

  @Prop()
  dateNaissance: Date;

  @Prop({ unique: true })
  numPermisConduire: string;

  @Prop()
  dateExpirationPermis: Date;

  @Prop({
    default: 'client',
    enum: ['admin', 'client'],
    type: String
  })
  role: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
