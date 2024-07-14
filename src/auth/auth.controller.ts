import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { token, email, role, userId } = req.user;
    console.log('Google callback token:', token);
    console.log('Google callback userId:', userId);
    return res.redirect(`http://localhost:3000/signin?token=${token}&userId=${userId}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth(@Req() req) {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookAuthRedirect(@Req() req, @Res() res: Response) {
    const { token, email, role, userId } = req.user;
    console.log('Facebook callback token:', token);
    console.log('Facebook callback userId:', userId);
    return res.redirect(`http://localhost:3000/signin?token=${token}&userId=${userId}`);
  }
}
