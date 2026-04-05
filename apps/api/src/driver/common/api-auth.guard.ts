import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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
  private resolveVerificationKey(): string {
    const publicKey =
      process.env.CLERK_JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY;
    const secret = process.env.JWT_SECRET;

    if (typeof publicKey === 'string' && publicKey.length > 0) {
      return publicKey;
    }

    if (typeof secret === 'string' && secret.length > 0) {
      return secret;
    }

    throw new UnauthorizedException('Unauthorized');
  }

  private verifyBearerToken(token: string): JwtPayload {
    try {
      const verificationKey = this.resolveVerificationKey();
      const verified = jwt.verify(token, verificationKey, {
        algorithms: ['RS256', 'HS256'],
      });

      if (typeof verified === 'string') {
        throw new UnauthorizedException('Unauthorized');
      }

      return verified as JwtPayload;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const forwardedUserId = this.getHeader(request, 'x-user-id');
    const forwardedProxySecret = this.getHeader(
      request,
      'x-internal-proxy-secret',
    );
    const trustedProxySecret = process.env.INTERNAL_PROXY_SECRET;

    if (forwardedUserId) {
      if (!trustedProxySecret || forwardedProxySecret !== trustedProxySecret) {
        throw new UnauthorizedException('Unauthorized');
      }

      request.user = {
        userId: forwardedUserId,
        email: this.getHeader(request, 'x-user-email') ?? undefined,
        firstName: this.getHeader(request, 'x-user-first-name') ?? undefined,
        lastName: this.getHeader(request, 'x-user-last-name') ?? undefined,
        phone: this.getHeader(request, 'x-user-phone') ?? undefined,
      };
      return true;
    }

    const authorization = this.getHeader(request, 'authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authorization.slice(7).trim();
    const decoded = this.verifyBearerToken(token);

    if (!decoded?.sub) {
      throw new UnauthorizedException('Unauthorized');
    }

    request.user = {
      userId: decoded.sub,
    };

    return true;
  }

  private getHeader(request: AuthenticatedRequest, key: string): string | null {
    const value = request.headers[key];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return typeof value === 'string' ? value : null;
  }
}
