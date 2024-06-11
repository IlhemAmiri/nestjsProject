import { Controller, Get, Post, Body, Param, Put, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { NoteService } from './note.service';
import { Note } from './note.entity';
import { CreateNoteDto, UpdateNoteDto } from './dto/note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('notes')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Client)
  @Post()
  async create(@Body() createNoteDto: CreateNoteDto): Promise<Note> {
    return this.noteService.create(createNoteDto);
  }

  @Get()
  async findAll(): Promise<Note[]> {
    return this.noteService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Note> {
    return this.noteService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Client)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto): Promise<Note> {
    return this.noteService.update(id, updateNoteDto);
  }


  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<string> {
    const deletedNote = await this.noteService.delete(id);
    return `La note avec l'identifiant ${id} a été supprimée`;
  }

  @UseGuards(JwtAuthGuard)
  @Get('client/:clientId')
  async getNoteByIdClient(@Param('clientId') clientId: string): Promise<Note[]> {
    try {
      return await this.noteService.getNoteByIdClient(clientId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get('car/:carId')
  async getNoteByIdCar(@Param('carId') carId: string): Promise<Note[]> {
    try {
      return await this.noteService.getNoteByIdCar(carId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
