import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthenticatedUser } from './current-user.decorator.js';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto.js';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Login and receive JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login success',
    type: AuthResponseDto,
  })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Register user and receive JWT' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Registration success',
    type: AuthResponseDto,
  })
  register(@Body() dto: CreateUserDto) {
    return this.service.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user', type: AuthUserDto })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.service.me(user.userId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Sign out' })
  @ApiResponse({ status: 200, description: 'Logout success' })
  logout() {
    return { message: 'Logged out successfully' };
  }
}
