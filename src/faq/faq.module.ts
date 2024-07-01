import { Module } from '@nestjs/common';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Faq, FaqSchema } from './faq.entity';

@Module({  
  imports: [MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }])],
  providers: [FaqService],
  controllers: [FaqController]
})
export class FaqModule {}
