import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findOneByEmail(email: string, tenantId: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: {
        email,
        tenantId,
      },
      relations: ['role'],
    });
  }

  async findOneByGoogleId(googleId: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { googleId },
      relations: ['role', 'tenant'],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id }, relations: ['role'] });
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    const role = this.rolesRepository.create(roleData);
    return this.rolesRepository.save(role);
  }

  async findRoleByName(name: string, tenantId: string): Promise<Role | undefined> {
    return this.rolesRepository.findOne({ where: { name, tenantId } });
  }
}
