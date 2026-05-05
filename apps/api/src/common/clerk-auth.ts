import { verifyToken } from '@clerk/backend';
import { UnauthorizedException } from '@nestjs/common';

export interface ClerkTokenPayload {
  sub: string;
  [key: string]: unknown;
}

export async function verifyClerkToken(
  token: string,
): Promise<ClerkTokenPayload> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new UnauthorizedException('Unauthorized');
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    if (!payload?.sub) {
      throw new UnauthorizedException('Unauthorized');
    }

    return payload as ClerkTokenPayload;
  } catch {
    throw new UnauthorizedException('Unauthorized');
  }
}
