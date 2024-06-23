import { Controller, Get, Post, Body, Param, Put, Delete, Query, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CarService } from './car.service';
import { Car } from './car.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { SearchCarDto } from './dto/search-car.dto';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 4))  // Adjust the field name to 'images' and limit to 4 files
  async create(@Body() createCarDto: CreateCarDto, @UploadedFiles() files: Express.Multer.File[]): Promise<Car> {
    const imagePaths = files.map(file => `http://localhost:3001/uploads/${file.filename}`);
    return this.carService.create(createCarDto, imagePaths);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images', 4))  // Adjust the field name to 'images' and limit to 4 files
  async update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto, @UploadedFiles() files: Express.Multer.File[]): Promise<Car> {
    const imagePaths = files ? files.map(file => `http://localhost:3001/uploads/${file.filename}`) : null;
    return this.carService.update(id, updateCarDto, imagePaths);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12
  ): Promise<{ data: Car[], total: number, page: number, limit: number }> {
    const { data, total } = await this.carService.findAll(page, limit);
    return {
      data: data.map(car => ({
        ...car.toObject(),
        image: car.image ? `${car.image}` : null,
      }) as Car),
      total,
      page,
      limit,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Car> {
    const car = await this.carService.findOne(id);
    return {
      ...car.toObject(),
      image: car.image ? `${car.image}` : null,
    } as Car;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    await this.carService.delete(id);
    return `La voiture avec l'identifiant ${id} a été supprimée`;
  }

  @Get('search/search')
  async search(@Query() query: SearchCarDto): Promise<Car[]> {
    const cars = await this.carService.search(query);
    return cars.map(car => ({
      ...car.toObject(),
      image: car.image ? `${car.image}` : null,
    })) as Car[];
  }
}
