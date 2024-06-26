import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavouriteCarController } from './favourite-car.controller';
import { FavouriteCarService } from './favourite-car.service';
import { FavouriteCar, FavouriteCarSchema } from './favourite-car.entity';
import { Client, ClientSchema } from '../user/user.entity';
import { Car, CarSchema } from '../car/car.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FavouriteCar.name, schema: FavouriteCarSchema }]),
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
  ],
  controllers: [FavouriteCarController],
  providers: [FavouriteCarService],
})
export class FavouriteCarModule {}
