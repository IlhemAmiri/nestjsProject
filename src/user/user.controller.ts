import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User, Client } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('users')

export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() createUserDto: any): Promise<User> {
        return this.userService.register(createUserDto);
    }

    @Get()
    async getAllUsers(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @Post('login')
    async login(@Body() loginDto: { email: string, password: string }): Promise<{ token: string, email: string, role: string }> {
        return this.userService.login(loginDto.email, loginDto.password);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('clients')
    async getAllClients(): Promise<Client[]> {
        return this.userService.getAllClients();
    }

    @UseGuards(JwtAuthGuard)
    @Get('clients/:id')
    async getClient(@Param('id') id: string): Promise<Client> {
        return this.userService.getClient(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('clients/:id')
    async updateClient(@Param('id') id: string, @Body() updateClientDto: any): Promise<Client> {
        return this.userService.updateClient(id, updateClientDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('clients/:id')
    async deleteClient(@Param('id') id: string): Promise<string> {
        await this.userService.deleteClient(id);
        return `Le client avec l'identifiant ${id} a été supprimé`;
    }

}
