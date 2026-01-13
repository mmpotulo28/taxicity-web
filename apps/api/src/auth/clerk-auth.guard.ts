import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerkClient: ReturnType<typeof createClerkClient>;

  constructor(private configService: ConfigService) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
      publishableKey: this.configService.get<string>(
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      ),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check for session token in cookies or Authorization header
    // Use authenticateRequest for comprehensive checks including development JWTs
    try {
      const requestState = await this.clerkClient.authenticateRequest(
        request as unknown as Request,
        {
          secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
          publishableKey: this.configService.get<string>(
            'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
          ),
        },
      );

      if (!requestState.isSignedIn) {
        throw new UnauthorizedException();
      }

      const auth = requestState.toAuth();
      (request as unknown as { user: any }).user = { id: auth.userId };

      return true;
    } catch (err) {
      this.logger.error('Authentication failed', err);
      throw new UnauthorizedException();
    }
  }
}
