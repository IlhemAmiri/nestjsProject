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
import { PaymentModule } from './payment/payment.module';
import { BlogModule } from './blog/blog.module';
import { FavouriteCarModule } from './favourite-car/favourite-car.module';
import { FaqModule } from './faq/faq.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigAppModule,
    MongooseModule.forRoot('mongodb://0.0.0.0:27017/location-voiture?retryWrites=true&w=majority'),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7h' },
    }),
    UserModule,
    CarModule,
    ReservationModule,
    NoteModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),  // Chemin absolu vers le dossier uploads
      //rootPath: 'C:/Users/ilhem/OneDrive/Bureau/locationV/location-voiture/uploads',  // Chemin absolu vers le dossier uploads
      serveRoot: '/uploads', // Le chemin URL sous lequel les fichiers seront servis
      serveStaticOptions: {
        redirect: false, // Désactiver les redirections par défaut
        index: false // Désactiver la gestion des index par défaut
      },
    }),
    PaymentModule,
    BlogModule,
    FavouriteCarModule,
    FaqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }      
