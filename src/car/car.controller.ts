import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { CarService } from './car.service';

@Controller('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  async create(@Body() createCarDto: any) {
    return this.carService.create(createCarDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCarDto: any) {
    return this.carService.update(id, updateCarDto);
  }

  @Get()
  async findAll() {
    return this.carService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.carService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.carService.delete(id);
  }

  @Get('search/search') 
  async search(@Query() query: any) { 
    return this.carService.search(query);
  }
}
