import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './note.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
  ) { }

  async create(noteDto: CreateNoteDto): Promise<Note> {
    const { idClient, idVoiture } = noteDto;

    // Vérifier si une note existe déjà pour la voiture donnée par le client
    const existingNote = await this.noteModel.findOne({ idClient, idVoiture }).exec();
    if (existingNote) {
      throw new BadRequestException('Le client a déjà donné une note pour cette voiture.');
    }

    const createdNote = new this.noteModel(noteDto);
    return createdNote.save();
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find().exec();
  }

  async findById(id: string): Promise<Note> {
    return this.noteModel.findById(id).exec();
  }

  async update(id: string, noteDto: UpdateNoteDto): Promise<Note> {
    const { note } = noteDto;
    if (note && (note < 1 || note > 5)) {
      throw new BadRequestException('La note doit être comprise entre 1 et 5.');
    }

    return this.noteModel.findOneAndUpdate({ _id: id }, noteDto, { new: true }).exec();

  }
  async delete(id: string): Promise<Note> {
    return this.noteModel.findByIdAndDelete(id).exec();
  }
  async getNoteByIdClient(idClient: string): Promise<Note[]> {
    return this.noteModel.find({ idClient }).exec();
  }

  async getNoteByIdCar(idVoiture: string): Promise<Note[]> {
    return this.noteModel.find({ idVoiture }).exec();
  }
}
