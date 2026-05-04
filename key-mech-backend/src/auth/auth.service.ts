import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    return user;
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string | null;
    role: AuthUserDto['role'];
  }): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(body: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  async register(body: CreateUserDto): Promise<AuthResponseDto> {
    const created = await this.usersService.create(body);

    const payload = {
      sub: created.id,
      email: created.email,
      role: created.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthUser(created),
    };
  }

  async me(userId: string): Promise<AuthUserDto> {
    return this.toAuthUser(await this.usersService.findPublicById(userId));
  }
}
