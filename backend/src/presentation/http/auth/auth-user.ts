// The authenticated caller, as the HTTP layer sees it.
export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
}

// Port: turns a bearer token into an AuthUser or throws.
// The Keycloak adapter lives in infrastructure/auth.
export abstract class TokenVerifier {
  abstract verify(token: string): Promise<AuthUser>;
}
