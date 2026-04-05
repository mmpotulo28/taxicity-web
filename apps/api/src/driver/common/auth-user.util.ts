import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from './api-auth.guard';

export function getAuthenticatedUser(
  req: AuthenticatedRequest,
): AuthenticatedUser {
  if (!req.user?.userId) {
    throw new UnauthorizedException('Unauthorized');
  }

  return req.user;
}
