import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './note.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { Car } from '../car/car.entity';
import { Client } from '../user/user.entity';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Car.name) private readonly carModel: Model<Car>,
  ) { }

  async create(noteDto: CreateNoteDto): Promise<Note> {
    const { idClient, idVoiture } = noteDto;

    // Vérifier si le client existe
    const clientExists = await this.clientModel.exists({ _id: idClient }).exec();
    if (!clientExists) {
      throw new BadRequestException('Le client spécifié n\'existe pas.');
    }

    // Vérifier si la voiture existe
    const carExists = await this.carModel.exists({ _id: idVoiture }).exec();
    if (!carExists) {
      throw new BadRequestException('La voiture spécifiée n\'existe pas.');
    }

    // Vérifier si une note existe déjà pour la voiture donnée par le client et n'est pas supprimée
    const existingNote = await this.noteModel.findOne({ idClient, idVoiture, deleted_at: null }).exec();
    if (existingNote) {
      throw new BadRequestException('Le client a déjà donné une note pour cette voiture.');
    }

    const createdNote = new this.noteModel(noteDto);
    return createdNote.save();
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find({ deleted_at: null }).exec();
  }

  async findById(id: string): Promise<Note> {
    const note = await this.noteModel.findOne({ _id: id, deleted_at: null }).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    return note;
  }

  async update(id: string, noteDto: UpdateNoteDto): Promise<Note> {
  const { note, idClient, idVoiture } = noteDto;

  // Vérifier la valeur de la note
  if (note && (note < 1 || note > 5)) {
    throw new BadRequestException('La note doit être comprise entre 1 et 5.');
  }

  // Vérifier si le client existe
  if (idClient) {
    const clientExists = await this.clientModel.exists({ _id: idClient }).exec();
    if (!clientExists) {
      throw new BadRequestException('Le client spécifié n\'existe pas.');
    }
  }

  // Vérifier si la voiture existe
  if (idVoiture) {
    const carExists = await this.carModel.exists({ _id: idVoiture }).exec();
    if (!carExists) {
      throw new BadRequestException('La voiture spécifiée n\'existe pas.');
    }
  }

  // Mettre à jour la note si elle n'est pas supprimée
  const updatedNote = await this.noteModel.findOneAndUpdate(
    { _id: id, deleted_at: null },
    noteDto,
    { new: true }
  ).exec();

  if (!updatedNote) {
    throw new NotFoundException('Note not found');
  }

  return updatedNote;
}


  async delete(id: string): Promise<Note> {
    const deletedNote = await this.noteModel.findByIdAndUpdate(id, { deleted_at: new Date() }, { new: true }).exec();
    if (!deletedNote) {
      throw new NotFoundException('Note not found');
    }
    return deletedNote;
  }
  async getNoteByIdClient(idClient: string): Promise<Note[]> {
    return this.noteModel.find({ idClient, deleted_at: null  }).exec();
  }

  async getNoteByIdCar(idVoiture: string): Promise<Note[]> {
    return this.noteModel.find({ idVoiture, deleted_at: null  }).exec();
  }
}
