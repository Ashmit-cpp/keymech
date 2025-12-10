import { Controller, Post, Req, Res, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Login and receive JWT; merges guest cart into user cart if present' })
  @ApiResponse({ status: 200, description: 'Login success' })
  login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.login(dto, req, res);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Register user and receive JWT; merges guest cart if present' })
  @ApiResponse({ status: 201, description: 'Registration success' })
  register(@Body() dto: CreateUserDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.service.register(dto, req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Sign out' })
  @ApiResponse({ status: 200, description: 'Logout success' })
  logout() {
    return { message: 'Logged out successfully' };
  }

}

