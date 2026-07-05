import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard.js';
import {
  CreateGarageBuildDto,
  GarageBuildResponseDto,
  UpdateGarageBuildDto,
} from './dto/garage-build.dto.js';
import { GarageService } from './garage.service.js';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
}

@Controller('garage/builds')
@ApiTags('garage')
@ApiBearerAuth()
export class GarageController {
  constructor(private readonly service: GarageService) {}

  private getUserId(req: RequestWithUser): string {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedException('User is not authenticated');
    return userId;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a saved Garage build' })
  @ApiBody({ type: CreateGarageBuildDto })
  @ApiResponse({
    status: 201,
    description: 'Garage build created',
    type: GarageBuildResponseDto,
  })
  create(@Req() req: RequestWithUser, @Body() dto: CreateGarageBuildDto) {
    return this.service.create(this.getUserId(req), dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Garage builds for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user Garage builds',
    type: [GarageBuildResponseDto],
  })
  findMe(@Req() req: RequestWithUser) {
    return this.service.findForCurrentUser(this.getUserId(req));
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get a public Garage build or an owned private build',
  })
  @ApiParam({ name: 'id', description: 'Garage build UUID' })
  @ApiResponse({
    status: 200,
    description: 'Garage build found',
    type: GarageBuildResponseDto,
  })
  findOne(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.findVisible(id, req.user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Update an owned Garage build' })
  @ApiParam({ name: 'id', description: 'Garage build UUID' })
  @ApiBody({ type: UpdateGarageBuildDto })
  @ApiResponse({
    status: 200,
    description: 'Garage build updated',
    type: GarageBuildResponseDto,
  })
  update(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateGarageBuildDto,
  ) {
    return this.service.update(this.getUserId(req), id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an owned Garage build' })
  @ApiParam({ name: 'id', description: 'Garage build UUID' })
  @ApiResponse({ status: 200, description: 'Garage build deleted' })
  remove(
    @Req() req: RequestWithUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.remove(this.getUserId(req), id);
  }
}
