import { ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

export interface Paging {
  page: number;
  limit: number;
  skip: number;
}

export interface UserAuthLikeRequest extends Request {
  user?: {
    userId?: string;
  };
}

@Injectable()
export class UserApiHelpers {
  toPositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  parsePaging(
    pageRaw: string | undefined,
    limitRaw: string | undefined,
    defaultLimit = 20,
  ): Paging {
    const page = this.toPositiveInt(pageRaw, 1);
    const limit = this.toPositiveInt(limitRaw, defaultLimit);
    return {
      page,
      limit,
      skip: (page - 1) * limit,
    };
  }

  getUserId(req: UserAuthLikeRequest): string {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ForbiddenException('Unauthorized');
    }
    return userId;
  }

  getHeader(req: Request, name: string): string | null {
    const value = req.headers[name.toLowerCase()];
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return typeof value === 'string' ? value : null;
  }

  ensureAdmin(req: Request) {
    const role = this.getHeader(req, 'x-user-role')?.toUpperCase();
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Forbidden');
    }
  }

  asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
  }
}
