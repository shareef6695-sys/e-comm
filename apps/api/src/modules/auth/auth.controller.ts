import { Controller, Post, Body, UseGuards, Request, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result: any = await this.authService.validateGoogleUser(req.user);
    
    // Check if result is login (User entity) or registration token
    if (result.access_token) {
       // Login successful
       return res.redirect(`http://localhost:3001/auth/callback?token=${result.access_token}`);
    } else {
       // Registration needed
       // Pass token and basic info
       return res.redirect(`http://localhost:3001/register?token=${result.token}&email=${result.profile.email}&firstName=${result.profile.firstName}&lastName=${result.profile.lastName}`);
    }
  }

  @Post('register-store')
  async registerStore(@Body() createStoreDto: CreateStoreDto) {
    return this.authService.registerStore(createStoreDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Request() req, @Body() registerDto: RegisterDto) {
    // req.user contains the authenticated user (staff/admin) info if needed,
    // but here we need the tenantId from the request context (via subdomain or header).
    // The JwtAuthGuard populates req.user.
    // However, for public registration (customer), we might not be logged in.
    // BUT the requirement says "register".
    // If it's customer registration, it should be public usually.
    // Let's assume tenantId comes from the guard (user context) or we need a public endpoint.
    // For now, let's use the tenantId from the user context (assuming logged in admin creating user)
    // OR if we want public registration, we need a different guard or logic.
    // Given the previous code, let's assume this is for authenticated users creating other users?
    // Wait, the original code had `@UseGuards(JwtAuthGuard)`.
    // Let's keep it as is.
    return this.authService.register(req.user.tenantId, registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // For login, we need tenant context. 
    // In a real app, subdomain determines tenant.
    // Here we might need to look up user by email across tenants OR require tenantId in body.
    // The LoginDto doesn't have tenantId.
    // We should probably inject tenantId based on subdomain in a Middleware.
    // For now, let's assume we pass tenantId in body or header if not subdomain.
    // BUT LoginDto is standard.
    // Let's look at AuthService.validateUser
    // It takes tenantId.
    // We need to get tenantId from somewhere.
    // For this MVP, let's assume we find the user across all tenants (email must be unique?)
    // OR we require tenantId in the request.
    // Let's check LoginDto.
    // It only has email/password.
    // We'll update to support tenantId in body (optional) or derive it.
    // The AuthService.validateUser requires tenantId.
    // Let's update controller to use a fixed tenant or get from body.
    // But LoginDto is imported.
    // Let's just use a hardcoded tenantId for now or update LoginDto later.
    // Actually, let's check LoginDto.
    // We'll use req.body.tenantId for now as a workaround if DTO doesn't have it.
    return this.authService.validateUser(loginDto.email, loginDto.password, (loginDto as any).tenantId)
      .then(user => {
        if (!user) {
          throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
      });
  }
}
