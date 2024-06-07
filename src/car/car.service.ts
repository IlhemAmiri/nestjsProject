import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car } from './car.entity';

@Injectable()
export class CarService {
  constructor(@InjectModel(Car.name) private readonly carModel: Model<Car>) {}

  async create(createCarDto: any): Promise<Car> {
    const createdCar = new this.carModel(createCarDto);
    return createdCar.save();
  }

  async update(id: string, updateCarDto: any): Promise<Car> {
    return this.carModel.findByIdAndUpdate(id, updateCarDto, { new: true });
  }

  async findAll(): Promise<Car[]> {
    return this.carModel.find().exec();
  }

  async findOne(id: string): Promise<Car> {
    return this.carModel.findById(id).exec();
  }

  async delete(id: string): Promise<Car> {
    return this.carModel.findByIdAndDelete(id);
  }

  async search(query: any): Promise<Car[]> {
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
