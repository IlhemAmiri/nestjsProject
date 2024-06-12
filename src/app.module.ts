import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigAppModule } from '../config.module';
import { UserModule } from './user/user.module';
import { CarModule } from './car/car.module';
import { ReservationModule } from './reservation/reservation.module';
import { NoteModule } from './note/note.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigAppModule,
    MongooseModule.forRoot('mongodb://0.0.0.0:27017/location-voiture?retryWrites=true&w=majority'),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    CarModule,
    ReservationModule,
    NoteModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), 
    }),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
