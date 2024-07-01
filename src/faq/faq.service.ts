import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, FaqDocument } from './faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(@InjectModel(Faq.name) private faqModel: Model<FaqDocument>) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const createdFaq = new this.faqModel(createFaqDto);
    return createdFaq.save();
  }

  async findAll(): Promise<Faq[]> {
    return this.faqModel.find().exec();
  }

  async findOne(id: string): Promise<Faq> {
    const faq = await this.faqModel.findById(id).exec();
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const updatedFaq = await this.faqModel.findByIdAndUpdate(id, updateFaqDto, {
      new: true,
    }).exec();
    if (!updatedFaq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return updatedFaq;
  }

  async remove(id: string): Promise<Faq> {
    const deletedFaq = await this.faqModel.findByIdAndDelete(id).exec();
    if (!deletedFaq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return deletedFaq;
  }
}
