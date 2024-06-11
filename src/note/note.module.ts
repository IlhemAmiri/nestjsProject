import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { Note, NoteSchema } from './note.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from '../user/user.entity';
import { Car, CarSchema } from '../car/car.entity';
@Module({
  imports: [MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
  MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),],
  controllers: [NoteController],
  providers: [NoteService]
})
export class NoteModule {}
