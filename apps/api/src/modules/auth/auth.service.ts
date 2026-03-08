import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

  async register(tenantId: string, registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email, tenantId);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Find default customer role or create if not exists
    let role = await this.usersService.findRoleByName('customer', tenantId);
    if (!role) {
       role = await this.usersService.createRole({ name: 'customer', tenantId, permissions: [] });
    }

    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
      tenantId: tenantId,
      roleId: role.id
    });

    // Populate role for return
    user.role = role;
    delete user.passwordHash;
    return user;
  }

  async registerStore(dto: CreateStoreDto) {
    let googleProfile: any = null;

    if (dto.googleToken) {
      try {
        const payload = this.jwtService.verify(dto.googleToken);
        if (!payload.googleId) {
          throw new UnauthorizedException('Invalid Google Token');
        }
        googleProfile = payload;
      } catch (e) {
        throw new UnauthorizedException('Invalid or expired Google Token');
      }
    }

    if (!dto.password && !googleProfile) {
      throw new BadRequestException('Password is required');
    }

    // 1. Check if subdomain exists
    try {
      await this.tenantsService.findBySlug(dto.subdomain);
      // If we are here, it means no error was thrown, so tenant exists
      throw new BadRequestException('Store subdomain already taken');
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      // If NotFoundException, that's what we want
      if (!(e instanceof NotFoundException)) {
        throw e;
      }
    }

    // 2. Create Tenant
    const tenant = await this.tenantsService.create({
      name: dto.storeName,
      slug: dto.subdomain,
      plan: 'free',
      status: 'active'
    });

    // 3. Create Admin Role
    const adminRole = await this.usersService.createRole({
      tenantId: tenant.id,
      name: 'admin',
      permissions: ['*']
    });

    // 4. Create User
    const password = dto.password || Math.random().toString(36).slice(-8); // Random password for Google users
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.usersService.create({
      email: googleProfile ? googleProfile.email : dto.email,
      passwordHash: hashedPassword,
      firstName: googleProfile ? googleProfile.firstName : dto.firstName,
      lastName: googleProfile ? googleProfile.lastName : dto.lastName,
      tenantId: tenant.id,
      roleId: adminRole.id,
      isStaff: true,
      googleId: googleProfile ? googleProfile.googleId : undefined,
    });

    // Manually assign relations for login payload
    user.role = adminRole;
    user.tenant = tenant;

    return this.login(user);
  }

  async validateGoogleUser(profile: any) {
    const user = await this.usersService.findOneByGoogleId(profile.googleId);
    if (user) {
      return this.login(user);
    }
    // Return a temporary token for registration
    const payload = { 
      googleId: profile.googleId, 
      email: profile.email, 
      firstName: profile.firstName, 
      lastName: profile.lastName,
      picture: profile.picture,
      type: 'google_registration'
    };
    return {
      action: 'register',
      token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      profile: payload
    };
  }

  async validateUser(email: string, pass: string, tenantId: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email, tenantId);
    if (user && user.passwordHash && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      tenantId: user.tenantId,
      role: user.role?.name || 'customer'
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role?.name,
        tenantId: user.tenantId
      },
    };
  }
}
