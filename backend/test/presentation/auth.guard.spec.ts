import 'reflect-metadata';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  type AuthUser,
  TokenVerifier,
} from '../../src/presentation/http/auth/auth-user.js';
import {
  IS_PUBLIC_KEY,
  ROLES_KEY,
} from '../../src/presentation/http/auth/auth.decorators.js';
import { AuthGuard } from '../../src/presentation/http/auth/auth.guard.js';

// Fake verifier: "alice-token" is a plain user, "bob-token" is an admin.
class FakeTokenVerifier implements TokenVerifier {
  verify(token: string): Promise<AuthUser> {
    const users: Record<string, AuthUser> = {
      'alice-token': { id: '1', username: 'alice', roles: ['user'] },
      'bob-token': { id: '2', username: 'bob', roles: ['user', 'admin'] },
    };
    return users[token]
      ? Promise.resolve(users[token])
      : Promise.reject(new Error('bad token'));
  }
}

function contextFor(
  authorization: string | undefined,
  metadata: Record<string, unknown> = {},
): { context: ExecutionContext; request: { user?: AuthUser } } {
  const handler = () => undefined;
  for (const [key, value] of Object.entries(metadata)) {
    Reflect.defineMetadata(key, value, handler);
  }
  const request = { headers: { authorization } } as { user?: AuthUser };
  const context = {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('AuthGuard', () => {
  const guard = new AuthGuard(new Reflector(), new FakeTokenVerifier());

  it('lets @Public() routes through without a token', async () => {
    const { context } = contextFor(undefined, { [IS_PUBLIC_KEY]: true });
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects a missing or invalid token with 401', async () => {
    await expect(
      guard.canActivate(contextFor(undefined).context),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      guard.canActivate(contextFor('Bearer nope').context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('attaches the user to the request', async () => {
    const { context, request } = contextFor('Bearer alice-token');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user?.username).toBe('alice');
  });

  it('enforces @Roles()', async () => {
    const adminOnly = { [ROLES_KEY]: ['admin'] };

    await expect(
      guard.canActivate(contextFor('Bearer alice-token', adminOnly).context),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      guard.canActivate(contextFor('Bearer bob-token', adminOnly).context),
    ).resolves.toBe(true);
  });
});
