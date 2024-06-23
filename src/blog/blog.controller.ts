import { 
    Controller, Get, Post, Body, Param, Query, Delete, Put, UploadedFile, UseInterceptors, UseGuards 
  } from '@nestjs/common';
  import { BlogService } from './blog.service';
  import { Blog } from './blog.entity';
  import { CreateBlogDto } from './dto/create-blog.dto';
  import { UpdateBlogDto } from './dto/update-blog.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { Roles } from '../auth/roles.decorator';
  import { Role } from '../auth/role.enum';
  
  @Controller('blogs')
  export class BlogController {
    constructor(private readonly blogService: BlogService) {}
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(@Body() createBlogDto: CreateBlogDto, @UploadedFile() file: Express.Multer.File): Promise<Blog> {
      const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
      return this.blogService.create(createBlogDto, imagePath);
    }
  
    @Get()
    async findAll(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10
    ): Promise<{ data: Blog[], total: number, page: number, limit: number }> {
      return this.blogService.findAll(page, limit);
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Blog> {
      return this.blogService.findOne(id);
    }
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<Blog> {
      return this.blogService.delete(id);
    }
  
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @UploadedFile() file: Express.Multer.File): Promise<Blog> {
      const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
      return this.blogService.update(id, updateBlogDto, imagePath);
    }
  }
  