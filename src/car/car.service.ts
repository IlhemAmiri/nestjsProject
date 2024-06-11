import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './car.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Note } from '../note/note.entity';
interface CarDocument extends Car, Document {
  _id: string;
}


@Injectable()
export class CarService {
  constructor(@InjectModel(Car.name) private readonly carModel: Model<CarDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
  ) { }

  async create(createCarDto: any, imagePath: string): Promise<Car> {
    if (!imagePath) {
      throw new NotFoundException('Image not found');
    }
    const createdCar = new this.carModel({ ...createCarDto, image: imagePath });
    return createdCar.save();
  }

  async update(id: string, updateCarDto: any, imagePath?: string): Promise<CarDocument> {
    const updateData = imagePath ? { ...updateCarDto, image: imagePath } : updateCarDto;
    const updatedCar = await this.carModel.findByIdAndUpdate(
      { _id: id, deleted_at: null },
      updateData,
      { new: true }
    ).exec();
    if (!updatedCar) {
      throw new NotFoundException('Car not found');
    }
    return updatedCar;
  }

  async findAll(): Promise<any[]> {
    const cars = await this.carModel.find({ deleted_at: null }).exec();
    for (const car of cars) {
      car.note = await this.calculateAverageNote(car._id);
    }
    return cars;
  }


  async findOne(id: string): Promise<any> {
    const car = await this.carModel.findOne({ _id: id, deleted_at: null }).exec();
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    car.note = await this.calculateAverageNote(car._id);
    return car;
  }

  async delete(id: string): Promise<Car> {
    // Supprimer les réservations associées au client
    await this.reservationModel.updateMany(
      { idVoiture: id },
      { deleted_at: new Date() }
    ).exec();
    const deletedCar = await this.carModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    ).exec();

    if (!deletedCar) {
      throw new NotFoundException('Car not found');
    }
    return deletedCar;
  }

  async search(query: any): Promise<any[]> {
    const filter: any = { deleted_at: null };

    if (query.marque) {
      filter.marque = { $regex: new RegExp(query.marque, 'i') };
    }

    if (query.categorie) {
      filter.categorie = { $regex: new RegExp(query.categorie, 'i') };
    }

    if (query.modele) {
      filter.modele = { $regex: new RegExp(query.modele, 'i') };
    }

    if (query.caracteristique) {
      filter.caracteristiques = { $regex: new RegExp(query.caracteristique, 'i') };
    }
    const cars = await this.carModel.find(filter).exec();

    for (const car of cars) {
      car.note = await this.calculateAverageNote(car._id);
    }
    return cars;
  }

  private async calculateAverageNote(carId: string): Promise<number> {
    const notes = await this.noteModel.find({ idVoiture: carId, deleted_at: null }).exec();
    if (notes.length === 0) {
      return 0;
    }
    const total = notes.reduce((sum, note) => sum + note.note, 0);
    return total / notes.length;
  }
}