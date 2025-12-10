import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: any): TUser {
    // If there's an error or no user, just return undefined
    // This allows the request to continue without authentication
    if (err || !user) {
      return undefined as TUser;
    }
    return user;
  }
}

