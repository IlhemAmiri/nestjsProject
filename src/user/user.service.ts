import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, Client } from './user.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Note } from '../note/note.entity';
import { FavouriteCar } from '../favourite-car/favourite-car.entity';
import * as moment from 'moment';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import * as crypto from 'crypto';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Client.name) private clientModel: Model<Client>,
        @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
        @InjectModel(Note.name) private noteModel: Model<Note>,
        @InjectModel(FavouriteCar.name) private favouriteCarModel: Model<FavouriteCar>, // Injectez votre modèle FavouriteCar
        private readonly jwtService: JwtService,
    ) { }

    async register(createUserDto: any, imagePath: string): Promise<User> {
        const { email, password, dateNaissance } = createUserDto;
        if (!isAdult(dateNaissance)) {
            throw new BadRequestException('Client must be at least 18 years old');
        }
        const existingUser = await this.userModel.findOne({ email, deleted_at: null }).exec();
        const existingClient = await this.clientModel.findOne({ email, deleted_at: null }).exec();

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
            image: imagePath
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

    async login(email: string, password: string): Promise<{ token: string, email: string, role: string, userId: string }> {
        let user = await this.userModel.findOne({ email, deleted_at: null }).exec();

        if (!user) {
            user = await this.clientModel.findOne({ email, deleted_at: null }).exec();
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

        return { token, email: user.email, role: user.role, userId: user._id.toString() };
    }

    async updateClient(id: string, updateClientDto: any, imagePath?: string): Promise<Client> {
        const { dateNaissance } = updateClientDto;

        if (dateNaissance && !isAdult(dateNaissance)) {
            throw new BadRequestException('Client must be at least 18 years old');
        }
        const updateData = imagePath ? { ...updateClientDto, image: imagePath } : updateClientDto;
        const updatedClient = await this.clientModel.findOneAndUpdate(
            { _id: id, deleted_at: null },
            updateData,
            { new: true }
        ).exec();
        if (!updatedClient) {
            throw new NotFoundException('Client not found');
        }
        return updatedClient;
    }


    async getClient(id: string): Promise<Client> {
        const client = await this.clientModel.findById({ _id: id, deleted_at: null }).exec();
        if (!client) {
            throw new NotFoundException('Client not found');
        }
        return client;
    }

    async getAllClients(): Promise<Client[]> {
        return this.clientModel.find({ deleted_at: null }).exec();
    }

    async deleteClient(id: string): Promise<void> {
        // Supprimer les réservations associées au client

        await this.reservationModel.updateMany(
            { idClient: id },
            { deleted_at: new Date() }
        ).exec();
        await this.noteModel.updateMany(
            { idClient: id },
            { deleted_at: new Date() }
        ).exec();
        await this.favouriteCarModel.deleteMany(
            { idClient: id }
        ).exec();
        // Supprimer le client lui-même
        const deletedClient = await this.clientModel.findByIdAndUpdate(id, { deleted_at: new Date() }).exec();
        if (!deletedClient) {
            throw new NotFoundException('Client not found');
        }
    }

    private generateRandomPassword(): string {
        return crypto.randomBytes(8).toString('hex'); // Génère un mot de passe aléatoire de 16 caractères
    }

    private generateFakeEmail(user: any): string {
        return `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@example.com`;
    }

    async findOrCreateGoogleUser(user: any): Promise<any> {
        let email = user.email || this.generateFakeEmail(user);

        let existingUser = await this.clientModel.findOne({ email, deleted_at: null }).exec();

        if (!existingUser) {
            const newUser = new this.clientModel({
                email,
                nom: user.firstName,
                prenom: user.lastName,
                image: user.picture,
                role: 'client',
                password: this.generateRandomPassword(), // Génère un mot de passe aléatoire
                CIN: 'CIN1234560',
                passport: 'PASS1234560',
                adresse: '123 Fake Street',
                numTel: '12345678900',
                dateNaissance: new Date('1990-01-01'),
                numPermisConduire: 'PERMIS1234560',
                dateExpirationPermis: new Date('2030-01-01'),
                accessToken: user.accessToken,
            });

            existingUser = await newUser.save();
        }

        // Générer le token JWT pour l'utilisateur
        const payload = { email: existingUser.email, sub: existingUser._id, role: existingUser.role };
        const token = this.jwtService.sign(payload);

        return { token, email: existingUser.email, role: existingUser.role, userId: existingUser._id.toString() };
    }



    async findOrCreateFacebookUser(user: any): Promise<any> {
        let email = user.email || this.generateFakeEmail(user);

        let existingUser = await this.clientModel.findOne({ email, deleted_at: null }).exec();

        if (!existingUser) {
            const newUser = new this.clientModel({
                email,
                nom: user.firstName,
                prenom: user.lastName,
                image: user.picture,
                role: 'client',
                password: this.generateRandomPassword(), // Génère un mot de passe aléatoire
                CIN: 'CIN6543210',
                passport: 'PASS6543210',
                adresse: '456 Fake Avenue',
                numTel: '09876543210',
                dateNaissance: new Date('1995-05-05'),
                numPermisConduire: 'PERMIS6543210',
                dateExpirationPermis: new Date('2035-05-05'),
                accessToken: user.accessToken,
            });

            existingUser = await newUser.save();
        }

        // Générer le token JWT pour l'utilisateur
        const payload = { email: existingUser.email, sub: existingUser._id, role: existingUser.role };
        const token = this.jwtService.sign(payload);

        return { token, email: existingUser.email, role: existingUser.role, userId: existingUser._id.toString() };
    }

}


function isAdult(dateOfBirth: Date): boolean {
    const today = moment();
    const birthDate = moment(dateOfBirth);
    const age = today.diff(birthDate, 'years');
    return age >= 18;
}