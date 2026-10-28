import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { AuthUser } from './auth-user.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// Skips authentication for a route or controller.
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Requires every listed Keycloak realm role.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
