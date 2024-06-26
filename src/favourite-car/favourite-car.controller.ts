import { Controller, Post, Delete, Param, Body, UseGuards, Get } from '@nestjs/common';
import { FavouriteCarService } from './favourite-car.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CreateFavCarDto } from './dto/create-favcar.dto';
import { RemoveFavCarDto } from './dto/remove-favcar.dto';
import { FavouriteCar } from './favourite-car.entity';

@Controller('favorite-cars')
export class FavouriteCarController {
  constructor(private readonly favouriteCarService: FavouriteCarService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Client)
  @Post()
  async addFavouriteCar(@Body() createFavCarDto: CreateFavCarDto): Promise<FavouriteCar> {
    return this.favouriteCarService.addFavouriteCar(createFavCarDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Client)
  @Delete()
  async removeFavouriteCar(@Body() removeFavCarDto: RemoveFavCarDto): Promise<void> {
    return this.favouriteCarService.removeFavouriteCar(removeFavCarDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Client)
  @Get('client/:clientId')
  async getFavouriteCarsByClientId(@Param('clientId') clientId: string): Promise<FavouriteCar[]> {
    return this.favouriteCarService.getFavouriteCarsByClientId(clientId);
  }
}
