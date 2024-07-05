import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './car.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Note } from '../note/note.entity';
import { SearchCarDto } from './dto/search-car.dto';


interface CarDocument extends Car, Document {
  _id: string;
}


@Injectable()
export class CarService {
  constructor(@InjectModel(Car.name) private readonly carModel: Model<CarDocument>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Note.name) private readonly noteModel: Model<Note>,
  ) { }

  async create(createCarDto: any, imagePaths: string[]): Promise<Car> {
    if (!imagePaths || imagePaths.length === 0) {
      throw new NotFoundException('Images not found');
    }
    const createdCar = new this.carModel({ ...createCarDto, image: imagePaths[0], image2: imagePaths[1], image3: imagePaths[2], image4: imagePaths[3] });
    return createdCar.save();
  }

  async update(id: string, updateCarDto: any, imagePaths?: string[]): Promise<CarDocument> {
    const updateData = imagePaths && imagePaths.length > 0 
      ? { ...updateCarDto, image: imagePaths[0], image2: imagePaths[1], image3: imagePaths[2], image4: imagePaths[3] }
      : updateCarDto;
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

  async findAll(page: number, limit: number): Promise<{ data: any[], total: number }> {
    const skip = (page - 1) * limit;
    const total = await this.carModel.countDocuments({ deleted_at: null }).exec();
    const cars = await this.carModel.find({ deleted_at: null })
      .skip(skip)
      .limit(limit)
      .exec();
  
    for (const car of cars) {
      car.note = await this.calculateAverageNote(car._id);
    }
  
    return { data: cars, total };
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
    await this.noteModel.updateMany(
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

  async search(query: SearchCarDto): Promise<Car[]> {
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