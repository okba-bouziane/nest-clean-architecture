import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeycloakTokenVerifier } from './infrastructure/auth/keycloak-token.verifier.js';
import { HealthController } from './infrastructure/health/health.controller.js';
import { TokenVerifier } from './presentation/http/auth/auth-user.js';
import { AuthGuard } from './presentation/http/auth/auth.guard.js';
import { TasksModule } from './tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL: relational source of truth for tasks
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get(
          'POSTGRES_URL',
          'postgres://clean:clean@localhost:5432/clean_tasks',
        ),
        autoLoadEntities: true,
        // Fine for a demo. In production use migrations instead.
        synchronize: config.get('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),

    // MongoDB: append-only activity log
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('MONGO_URL', 'mongodb://localhost:27018/clean_tasks'),
      }),
    }),

    TasksModule,
  ],
  controllers: [HealthController],
  providers: [
    // Keycloak: every route needs a valid access token unless @Public()
    { provide: TokenVerifier, useClass: KeycloakTokenVerifier },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
