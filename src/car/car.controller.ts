import { Controller, Get, Post, Body, Param, Put, Delete, Query, UploadedFile, UseInterceptors, UseGuards, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() createCarDto: CreateCarDto, @UploadedFile() file: Express.Multer.File): Promise<Car> {
    const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
    return this.carService.create(createCarDto, imagePath);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto, @UploadedFile() file: Express.Multer.File): Promise<Car> {
    const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
    return this.carService.update(id, updateCarDto, imagePath);
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
