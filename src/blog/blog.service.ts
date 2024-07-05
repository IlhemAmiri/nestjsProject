import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from './blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private readonly blogModel: Model<Blog>) {}

  async create(createBlogDto: CreateBlogDto, imagePath: string): Promise<Blog> {
    const newBlog = new this.blogModel({ ...createBlogDto, image: imagePath });
    return newBlog.save();
  }

  async findAll(page: number, limit: number): Promise<{ data: Blog[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit;
    const total = await this.blogModel.countDocuments().exec();
    const blogs = await this.blogModel.find()
      .skip(skip)
      .limit(limit)
      .exec();
    return { data: blogs, total, page, limit };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException('Blog post not found');
    }
    return blog;
  }

  async delete(id: string): Promise<Blog> {
    const deletedBlog = await this.blogModel.findByIdAndDelete(id).exec();
    if (!deletedBlog) {
      throw new NotFoundException('Blog post not found');
    }
    return deletedBlog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto, imagePath: string): Promise<Blog> {
    if (typeof updateBlogDto.content === 'string') {
      updateBlogDto.content = JSON.parse(updateBlogDto.content);
    }
  
    const updatedData = { ...updateBlogDto, image: imagePath || updateBlogDto.image };
    const existingBlog = await this.blogModel.findByIdAndUpdate(id, updatedData, { new: true }).exec();
    if (!existingBlog) {
      throw new NotFoundException('Blog post not found');
    }
    return existingBlog;
  }
  
}
