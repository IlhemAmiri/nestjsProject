import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FavouriteCar } from './favourite-car.entity';
import { Client } from '../user/user.entity';
import { Car } from '../car/car.entity';
import { CreateFavCarDto } from './dto/create-favcar.dto';
import { RemoveFavCarDto } from './dto/remove-favcar.dto';

@Injectable()
export class FavouriteCarService {
  constructor(
    @InjectModel(FavouriteCar.name) private favouriteCarModel: Model<FavouriteCar>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Car.name) private carModel: Model<Car>,
  ) {}

  async addFavouriteCar(createFavCarDto: CreateFavCarDto): Promise<FavouriteCar> {
    const { idClient, idVoiture } = createFavCarDto;

    // Check if client exists
    const clientExists = await this.clientModel.exists({ _id: idClient, deleted_at: null }).exec();
    if (!clientExists) {
        throw new NotFoundException('Client not found or deleted');
    }

    // Check if car exists
    const carExists = await this.carModel.exists({ _id: idVoiture, deleted_at: null }).exec();
    if (!carExists) {
        throw new NotFoundException('Car not found or deleted');
    }

    const existingFavouriteCar = await this.favouriteCarModel.findOne({ idClient, idVoiture, deleted_at: null }).exec();
    if (existingFavouriteCar) {
        throw new BadRequestException('The client already has this car as a favourite.');
    }

    const newFavouriteCar = new this.favouriteCarModel(createFavCarDto);
    return await newFavouriteCar.save();
  }

  async removeFavouriteCar(removeFavCarDto: RemoveFavCarDto): Promise<void> {
    const { idClient, idVoiture } = removeFavCarDto;
    const favouriteCar = await this.favouriteCarModel.findOne({ idClient, idVoiture }).exec();
    if (!favouriteCar) {
      throw new NotFoundException('Favourite car not found');
    }
    await this.favouriteCarModel.findByIdAndDelete(favouriteCar._id).exec();
  }
  
  async getFavouriteCarsByClientId(clientId: string): Promise<FavouriteCar[]> {
    return this.favouriteCarModel.find({ idClient: clientId, deleted_at: null }).exec();
  }
}