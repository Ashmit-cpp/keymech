import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

interface RequestWithUser extends Request {
  user?: { userId: string; email: string };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const payload = await this.jwtService.verifyAsync(token);
        req.user = { userId: payload.sub, email: payload.email };
      } catch (error) {
        // Token is invalid, but we don't throw error for optional auth
        req.user = undefined;
      }
    }

    next();
  }
}
