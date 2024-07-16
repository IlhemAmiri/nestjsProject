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
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
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
        const { email, dateNaissance } = updateClientDto;

        if (dateNaissance && !isAdult(dateNaissance)) {
            throw new BadRequestException('Client must be at least 18 years old');
        }
        const admin = await this.userModel.findOne({ role: 'admin' }).exec();
        if (admin && email === admin.email) {
            throw new BadRequestException('Cannot use admin email for a client');
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
                password: '',
                CIN: '',
                passport: '',
                adresse: '',
                numTel: '',
                dateNaissance: null,
                numPermisConduire: '',
                dateExpirationPermis: null,
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
                password: '',
                CIN: '',
                passport: '',
                adresse: '',
                numTel: '',
                dateNaissance: null,
                numPermisConduire: '',
                dateExpirationPermis: null,
                accessToken: user.accessToken,
            });

            existingUser = await newUser.save();
        }

        // Générer le token JWT pour l'utilisateur
        const payload = { email: existingUser.email, sub: existingUser._id, role: existingUser.role };
        const token = this.jwtService.sign(payload);

        return { token, email: existingUser.email, role: existingUser.role, userId: existingUser._id.toString() };
    }

    async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        let user = await this.userModel.findById(userId).exec();

        if (!user) {
            user = await this.clientModel.findById(userId).exec();
        }

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.password) {
            // Si le mot de passe actuel n'est pas vide, vérifier l'ancien mot de passe
            if (oldPassword) {
                const passwordMatches = await bcrypt.compare(oldPassword, user.password);
                if (!passwordMatches) {
                    throw new UnauthorizedException('Old password is incorrect');
                }
            } else {
                throw new BadRequestException('Old password is required');
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
    }

    // Configurez votre transporteur nodemailer
    private transporter = nodemailer.createTransport({
        service: 'gmail', // ou tout autre service de messagerie
        auth: {
            user: 'ilhem.amiri22@gmail.com', // votre email
            pass: 'dofz udva mvkg yhch', // votre mot de passe
        },
    });

    async forgotPassword(email: string): Promise<void> {
        console.log(`Forgot password for email: ${email}`);
        let user = await this.userModel.findOne({ email, deleted_at: null }).exec();
        if (!user) {
            user = await this.clientModel.findOne({ email, deleted_at: null }).exec();
        }

        if (!user) {
            console.log(`User not found for email: ${email}`);
            throw new NotFoundException('User with this email does not exist');
        }

        const resetToken = this.jwtService.sign({ email: user.email, sub: user._id }, { expiresIn: '1h' });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${email}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

        await this.transporter.sendMail({
            to: user.email,
            subject: 'Password reset token',
            text: message,
        });

        console.log(`Password reset email sent to: ${user.email}`);
    }

    async resetPassword(resetToken: string, newPassword: string, email: string): Promise<void> {
        console.log(`Reset password with token: ${resetToken}`);
        let user = await this.userModel.findOne({
            email,
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: new Date() }
        }).exec();

        if (!user) {
            user = await this.clientModel.findOne({
                email,
                resetPasswordToken: resetToken,
                resetPasswordExpires: { $gt: new Date() }
            }).exec();
        }

        if (!user) {
            console.log(`Invalid or expired token`);
            throw new NotFoundException('Password reset token is invalid or has expired');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log(`Password reset successful for user: ${user.email}`);
    }


}


function isAdult(dateOfBirth: Date): boolean {
    const today = moment();
    const birthDate = moment(dateOfBirth);
    const age = today.diff(birthDate, 'years');
    return age >= 18;
}