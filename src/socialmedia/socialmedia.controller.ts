import { Controller, Get, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { SocialMediaService } from './socialmedia.service';
import { CreateSocialMediaDto } from './dto/create-socialmedia.dto';
import { UpdateSocialMediaDto } from './dto/update-socialmedia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('socialmedia')
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() createSocialMediaDto: CreateSocialMediaDto) {
    return this.socialMediaService.create(createSocialMediaDto);
  }

  @Get()
  find() {
    return this.socialMediaService.find();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Body() updateSocialMediaDto: UpdateSocialMediaDto) {
    return this.socialMediaService.update(updateSocialMediaDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  remove() {
    return this.socialMediaService.remove();
  }
}
