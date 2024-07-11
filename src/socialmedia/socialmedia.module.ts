import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocialMediaService } from './socialmedia.service';
import { SocialMediaController } from './socialmedia.controller';
import { SocialMedia, SocialMediaSchema } from './socialmedia.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SocialMedia.name, schema: SocialMediaSchema }])
  ],
  providers: [SocialMediaService],
  controllers: [SocialMediaController]
})
export class SocialmediaModule {}
