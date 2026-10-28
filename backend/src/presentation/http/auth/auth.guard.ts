import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorators.js';
import { type AuthUser, TokenVerifier } from './auth-user.js';

// Global guard: every route needs a valid bearer token unless marked
// @Public(), and @Roles() adds role checks on top.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly verifier: TokenVerifier,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const token = this.bearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      request.user = await this.verifier.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const required =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, targets) ?? [];
    const missing = required.filter(
      (role) => !request.user!.roles.includes(role),
    );
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing role: ${missing.join(', ')}`);
    }
    return true;
  }

  private bearerToken(request: Request): string | undefined {
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    return scheme === 'Bearer' ? token : undefined;
  }
}
