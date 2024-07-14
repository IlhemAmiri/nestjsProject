import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      profileFields: ['emails', 'name', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const firstName = profile.name && profile.name.givenName ? profile.name.givenName : null;
    const lastName = profile.name && profile.name.familyName ? profile.name.familyName : null;
    const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

    const user = {
      email,
      firstName,
      lastName,
      picture,
      accessToken, // Ensure accessToken is part of the user object
    };

    // Save or find user in the database
    const existingUser = await this.userService.findOrCreateFacebookUser(user);

    done(null, { ...existingUser, accessToken });
  }
}
