import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards,UploadedFile,UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User, Client } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')

export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('image'))
    async register(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File): Promise<User> {
      const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
      return this.userService.register(createUserDto, imagePath);
    }
    

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get()
    async getAllUsers(): Promise<User[]> {
        const users = await this.userService.getAllUsers();
        return users.map(user => ({
            ...user.toObject(),
            image: user.image ? `${user.image}` : null
        })) as User[];
    }

    @Post('login')
    async login(@Body() loginDto: { email: string, password: string }): Promise<{ token: string, email: string, role: string }> {
        return this.userService.login(loginDto.email, loginDto.password);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('clients')
    async getAllClients(): Promise<Client[]> {
        const clients = await this.userService.getAllClients();
        return clients.map(client => ({
            ...client.toObject(),
            image: client.image ? `${client.image}` : null
        })) as Client[];
    }
    @UseGuards(JwtAuthGuard)
    @Get('clients/:id')
    async getClient(@Param('id') id: string): Promise<Client> {
        const client = await this.userService.getClient(id);
        client.image = client.image ? `${client.image}` : null;
        return client;
    }
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    @Put('clients/:id')
    async updateClient(
      @Param('id') id: string,
      @Body() updateClientDto: UpdateUserDto,
      @UploadedFile() file: Express.Multer.File
    ): Promise<Client> {
      const imagePath = file ? `http://localhost:3001/uploads/${file.filename}` : null;
      return this.userService.updateClient(id, updateClientDto, imagePath);
    }
    
    @UseGuards(JwtAuthGuard)
    @Delete('clients/:id')
    async deleteClient(@Param('id') id: string): Promise<string> {
        await this.userService.deleteClient(id);
        return `Le client avec l'identifiant ${id} a été supprimé`;
    }

    
    @UseGuards(JwtAuthGuard)
    @Put('update-password')
    async updatePassword(
        @Body() updatePasswordDto: { userId: string, oldPassword: string, newPassword: string }
    ): Promise<void> {
        await this.userService.updatePassword(updatePasswordDto.userId, updatePasswordDto.oldPassword, updatePasswordDto.newPassword);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: { email: string }): Promise<void> {
        await this.userService.forgotPassword(forgotPasswordDto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: { resetToken: string, newPassword: string }): Promise<void> {
        await this.userService.resetPassword(resetPasswordDto.resetToken, resetPasswordDto.newPassword);
    }

}
