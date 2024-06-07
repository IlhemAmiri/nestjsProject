import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, Client } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Client.name) private clientModel: Model<Client>,
        private readonly jwtService: JwtService,
    ) { }

    async register(createUserDto: any): Promise<User> {
        const { email, password } = createUserDto;
        const existingUser = await this.userModel.findOne({ email }).exec();
        const existingClient = await this.clientModel.findOne({ email }).exec();

        if (existingUser || existingClient) {
            throw new ConflictException('User already exists');
        }

        // Vérifiez s'il existe déjà un utilisateur admin
        const adminExists = await this.userModel.findOne({ role: 'admin' }).exec();
        const role = adminExists ? 'client' : 'admin';

        const hashedPassword = await bcrypt.hash(password, 10);

        const userToCreate = {
            ...createUserDto,
            password: hashedPassword,
            role: role,
        };

        let createdUser;
        if (role === 'client') {
            createdUser = new this.clientModel(userToCreate);
        } else {
            createdUser = new this.userModel(userToCreate);
        }

        return createdUser.save();
    }

    async getAllUsers(): Promise<User[]> {
        const users = await this.userModel.find().exec();
        const clients = await this.clientModel.find().exec();
        return [...users, ...clients];
    }

    async login(email: string, password: string): Promise<{ token: string, email: string, role: string }> {
        let user = await this.userModel.findOne({ email }).exec();

        if (!user) {
            user = await this.clientModel.findOne({ email }).exec();
        }

        if (!user) {
            console.error(`User with email ${email} not found`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            console.error(`Password for user with email ${email} does not match`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user._id, role: user.role };
        const token = this.jwtService.sign(payload);

        return { token, email: user.email, role: user.role };
    }
    async updateClient(id: string, updateClientDto: any): Promise<Client> {
        const updatedClient = await this.clientModel.findByIdAndUpdate(id, updateClientDto, { new: true }).exec();
        if (!updatedClient) {
            throw new NotFoundException('Client not found');
        }
        return updatedClient;
    }

    async getClient(id: string): Promise<Client> {
        const client = await this.clientModel.findById(id).exec();
        if (!client) {
            throw new NotFoundException('Client not found');
        }
        return client;
    }

    async getAllClients(): Promise<Client[]> {
        return this.clientModel.find().exec();
    }

    async deleteClient(id: string): Promise<void> {
        const deletedClient = await this.clientModel.findByIdAndDelete(id).exec();
        if (!deletedClient) {
            throw new NotFoundException('Client not found');
        }
    }
}


