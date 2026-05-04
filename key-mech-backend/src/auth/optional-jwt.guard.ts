import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from './current-user.decorator.js';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser | undefined>(
    err: unknown,
    user: AuthenticatedUser | false,
  ): TUser {
    if (err || !user) {
      return undefined as TUser;
    }
    return user as TUser;
  }
}
