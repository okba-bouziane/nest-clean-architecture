import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ConflictError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '../../domain/shared/domain-errors.js';

// Translates domain errors into HTTP responses, so the inner layers never
// import anything from @nestjs/common.
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const status = this.statusFor(error);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, error: error.name, message: error.message });
  }

  private statusFor(error: DomainError): HttpStatus {
    if (error instanceof ValidationError) return HttpStatus.BAD_REQUEST;
    if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof ConflictError) return HttpStatus.CONFLICT;
    return HttpStatus.UNPROCESSABLE_ENTITY;
  }
}
