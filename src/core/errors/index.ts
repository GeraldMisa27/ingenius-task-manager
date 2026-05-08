/**
 * Typed domain errors raised by repositories, domain functions, and server actions.
 *
 * Each error carries a code that matches the public ActionError contract,
 * allowing the mapper to translate them into uniform Server Action responses
 * without leaking implementation details to the client.
 */

import { ERROR_CODES, type ErrorCode, type FieldErrors } from "./types";

abstract class DomainError extends Error {
  abstract readonly code: ErrorCode;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = ERROR_CODES.UNAUTHORIZED;

  constructor(message = "Sesión requerida") {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = ERROR_CODES.FORBIDDEN;

  constructor(message = "No tienes permisos para esta acción") {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = ERROR_CODES.NOT_FOUND;

  constructor(entity: string) {
    super(`${entity} no encontrado`);
  }
}

export class ValidationError extends DomainError {
  readonly code = ERROR_CODES.VALIDATION;
  readonly fieldErrors: FieldErrors;

  constructor(fieldErrors: FieldErrors, message = "Datos inválidos") {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export class BusinessRuleError extends DomainError {
  readonly code = ERROR_CODES.BUSINESS_RULE;

  constructor(message: string) {
    super(message);
  }
}
