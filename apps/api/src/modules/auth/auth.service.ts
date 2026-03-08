import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(tenantId: string, registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersService.findOneByEmail(registerDto.email, tenantId);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
      tenantId: tenantId,
    });

    delete user.passwordHash;
    return user;
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
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
