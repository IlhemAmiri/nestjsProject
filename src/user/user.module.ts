import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, Client, ClientSchema } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigAppModule } from '../../config.module';
import { ReservationModule } from '../reservation/reservation.module';


@Module({
  imports: [
    ConfigAppModule,
    ReservationModule,
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
      { name: 'Reservation', schema: ReservationModule }
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [
    UserService,
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
  ],
})
export class UserModule {}
