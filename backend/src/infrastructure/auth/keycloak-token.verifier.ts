import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, type JWTPayload, jwtVerify } from 'jose';
import {
  type AuthUser,
  TokenVerifier,
} from '../../presentation/http/auth/auth-user.js';

interface KeycloakClaims extends JWTPayload {
  preferred_username?: string;
  realm_access?: { roles?: string[] };
}

// Adapter: verifies Keycloak access tokens locally with the realm's public
// keys (JWKS, cached by jose). No call to Keycloak per request.
@Injectable()
export class KeycloakTokenVerifier implements TokenVerifier {
  private readonly issuer: string;
  private readonly audience: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(config: ConfigService) {
    this.issuer = config.get(
      'KEYCLOAK_ISSUER',
      'http://localhost:8080/realms/clean-tasks',
    );
    this.audience = config.get('KEYCLOAK_AUDIENCE', 'clean-tasks-api');
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/protocol/openid-connect/certs`),
    );
  }

  async verify(token: string): Promise<AuthUser> {
    const { payload } = await jwtVerify<KeycloakClaims>(token, this.jwks, {
      issuer: this.issuer,
      audience: this.audience,
    });
    return {
      id: payload.sub!,
      username: payload.preferred_username ?? payload.sub!,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
