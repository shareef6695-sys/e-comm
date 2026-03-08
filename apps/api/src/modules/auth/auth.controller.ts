import { Controller, Request, Post, UseGuards, Body, BadRequestException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Request() req, @Body() registerDto: RegisterDto) {
    if (!req.tenant) {
      throw new BadRequestException('Tenant context is required');
    }
    return this.authService.register(req.tenant.id, registerDto);
  }

  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    if (!req.tenant) {
        throw new BadRequestException('Tenant context is required');
    }
    
    const user = await this.authService.validateUser(loginDto.email, loginDto.password, req.tenant.id);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
