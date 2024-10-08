import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { Car, CarSchema } from './car.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReservationModule } from '../reservation/reservation.module';
import { NoteModule } from '../note/note.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }]),
    ReservationModule,
    NoteModule,
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: './dist/uploads',
    //     filename: (req, file, cb) => {
    //       const randomName = Array(32)
    //         .fill(null)
    //         .map(() => Math.round(Math.random() * 16).toString(16))
    //         .join('');
    //       cb(null, `${randomName}${extname(file.originalname)}`);
    //     },
    //   }),
    // }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Première destination
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationModule },
      { name: 'Note', schema: NoteModule },
    ]),
  ],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
