import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateSocialMediaDto } from './dto/create-socialmedia.dto';
import { UpdateSocialMediaDto } from './dto/update-socialmedia.dto';
import { SocialMedia, SocialMediaDocument } from './socialmedia.entity';

@Injectable()
export class SocialMediaService {
  constructor(
    @InjectModel(SocialMedia.name) private socialMediaModel: Model<SocialMediaDocument>,
  ) {}

  async create(createSocialMediaDto: CreateSocialMediaDto): Promise<SocialMedia> {
    const existingSocialMedia = await this.socialMediaModel.findOne().exec();
    if (existingSocialMedia) {
      throw new ConflictException('Social media entry already exists.');
    }
    const createdSocialMedia = new this.socialMediaModel(createSocialMediaDto);
    return createdSocialMedia.save();
  }

  async find(): Promise<SocialMedia> {
    const socialMedia = await this.socialMediaModel.findOne().exec();
    if (!socialMedia) {
      throw new NotFoundException('SocialMedia entry not found');
    }
    return socialMedia;
  }

  async update(updateSocialMediaDto: UpdateSocialMediaDto): Promise<SocialMedia> {
    const existingSocialMedia = await this.socialMediaModel.findOneAndUpdate({}, updateSocialMediaDto, { new: true }).exec();
    if (!existingSocialMedia) {
      throw new NotFoundException('SocialMedia entry not found');
    }
    return existingSocialMedia;
  }

  async remove(): Promise<void> {
    const result = await this.socialMediaModel.findOneAndDelete().exec();
    if (!result) {
      throw new NotFoundException('SocialMedia entry not found');
    }
  }
}
