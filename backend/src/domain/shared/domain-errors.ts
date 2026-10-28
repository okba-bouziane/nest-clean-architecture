// Errors thrown by the domain and application layers.
// They know nothing about HTTP: the presentation layer maps them to status codes.
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}
