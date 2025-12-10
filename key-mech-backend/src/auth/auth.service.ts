import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { CartService } from '../cart/cart.service.js';
import { readCartId, clearCartCookie } from '../cart/cart-cookie.util.js';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    return user;
  }

  async login(body: LoginDto, req: Request, res: Response) {
    const user = await this.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // Note: Guest cart merge should be handled on frontend
    // Frontend sends guest cart items after receiving token

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: (user as any).name,
        role: (user as any).role,
      },
    };
  }

  async register(body: CreateUserDto, req: Request, res: Response) {
    const created = await this.usersService.create(body);

    const payload = { sub: created.id, email: created.email };
    const accessToken = await this.jwtService.signAsync(payload);

    // Note: Guest cart merge should be handled on frontend
    // Frontend sends guest cart items after receiving token

    return {
      accessToken,
      user: {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
      },
    };
  }
}

