import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './car.entity';
import { Reservation } from '../reservation/reservation.entity';


@Injectable()
export class CarService {
  constructor(@InjectModel(Car.name) private readonly carModel: Model<Car>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
  ) { }

  async create(createCarDto: any, imagePath: string): Promise<Car> {
    if (!imagePath) {
      throw new NotFoundException('Image not found');
    }
    const createdCar = new this.carModel({ ...createCarDto, image: imagePath });
    return createdCar.save();
  }

  async update(id: string, updateCarDto: any, imagePath?: string): Promise<Car> {
    const updateData = imagePath ? { ...updateCarDto, image: imagePath } : updateCarDto;
    return this.carModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findAll(): Promise<any[]> {
    return this.carModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    return this.carModel.findById(id).exec();
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
    const filter: any = {};

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

    return this.carModel.find(filter).exec();
  }

}
