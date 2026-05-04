import {
  ArgumentsHost,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
class HealthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(status).json({ status: 'error' });
  }
}

@Controller('health')
@UseFilters(HealthExceptionFilter)
export class HealthController {
  @Get()
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
