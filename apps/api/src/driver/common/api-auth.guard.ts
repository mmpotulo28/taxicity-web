import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/public.decorator';
import { verifyClerkToken } from '../../common/clerk-auth';

export interface AuthenticatedUser {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  private logAuthFailure(
    reason: string,
    request: AuthenticatedRequest,
    details?: Record<string, unknown>,
  ) {
    // Temporary diagnostics to pinpoint 401 causes in production logs.
    // No tokens or secrets are logged.
    console.warn('[ApiAuthGuard] Unauthorized request', {
      reason,
      method: request.method,
      path: request.originalUrl || request.url,
      hasAuthorizationHeader: Boolean(this.getHeader(request, 'authorization')),
      ...details,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = this.getHeader(request, 'authorization');
    if (!authorization?.startsWith('Bearer ')) {
      this.logAuthFailure('missing bearer authorization header', request);
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authorization.slice(7).trim();
    try {
      const decoded = await verifyClerkToken(token);
      request.user = {
        userId: decoded.sub,
      };
      return true;
    } catch (error) {
      this.logAuthFailure('token verification failed', request, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Unauthorized');
    }
  }

  private getHeader(request: AuthenticatedRequest, key: string): string | null {
    const value = request.headers[key];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return typeof value === 'string' ? value : null;
  }
}
