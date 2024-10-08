import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { User, UserSchema, Client, ClientSchema } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigAppModule } from '../../config.module';
import { ReservationModule } from '../reservation/reservation.module';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Reservation, ReservationSchema } from '../reservation/reservation.entity';
import { Note, NoteSchema } from '../note/note.entity';
import { FavouriteCar, FavouriteCarSchema } from '../favourite-car/favourite-car.entity';

@Module({
  imports: [
    ConfigAppModule,
    ReservationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7h' },
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Note.name, schema: NoteSchema },
      { name: FavouriteCar.name, schema: FavouriteCarSchema },
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [
    UserService,
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
})
export class UserModule { }
