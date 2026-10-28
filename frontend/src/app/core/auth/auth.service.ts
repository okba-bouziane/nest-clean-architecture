import { computed, Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { appSettings } from '../config';

// Wraps keycloak-js: login (Authorization Code + PKCE), token refresh, logout.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = new Keycloak(appSettings.keycloak);

  readonly username = signal('');
  readonly roles = signal<string[]>([]);
  readonly isAdmin = computed(() => this.roles().includes('admin'));

  // Runs before the app renders: redirects to the Keycloak login page if needed.
  async init(): Promise<void> {
    await this.keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    this.username.set(this.keycloak.tokenParsed?.['preferred_username'] ?? '');
    this.roles.set(
      (this.keycloak.realmAccess?.roles ?? []).filter((role) => ['user', 'admin'].includes(role)),
    );
  }

  // Returns a valid access token, refreshing it if it expires in < 30s.
  async token(): Promise<string> {
    await this.keycloak.updateToken(30);
    return this.keycloak.token ?? '';
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
