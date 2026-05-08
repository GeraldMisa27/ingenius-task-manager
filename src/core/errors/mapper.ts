/**
 * Translates raw thrown errors into the public ActionResponse error contract.
 *
 * Server Actions catch any error from the call stack and pass it through
 * toActionResponse, which:
 *   1. Recognizes typed domain errors and uses their code + message + fieldErrors.
 *   2. Recognizes ZodError and converts it into a VALIDATION response with
 *      fieldErrors keyed by the offending field path.
 *   3. Falls back to UNEXPECTED for any unknown error, with a safe message
 *      that does not leak internal details.
 */

import { ZodError } from "zod";
import {
  BusinessRuleError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "./index";
import { ERROR_CODES, type ActionResponse, type FieldErrors } from "./types";

export function toActionResponse<T>(error: unknown): ActionResponse<T> {
  if (
    error instanceof UnauthorizedError ||
    error instanceof ForbiddenError ||
    error instanceof NotFoundError ||
    error instanceof BusinessRuleError
  ) {
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  if (error instanceof ValidationError) {
    return {
      ok: false,
      error: {
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      ok: false,
      error: {
        code: ERROR_CODES.VALIDATION,
        message: "Datos inválidos",
        fieldErrors: zodIssuesToFieldErrors(error),
      },
    };
  }

  return {
    ok: false,
    error: {
      code: ERROR_CODES.UNEXPECTED,
      message: "Ocurrió un error inesperado",
    },
  };
}

/**
 * Converts ZodError.issues into a FieldErrors record keyed by the field path.
 * Top-level errors (no path) are grouped under "_root".
 */
function zodIssuesToFieldErrors(error: ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }
    fieldErrors[key].push(issue.message);
  }

  return fieldErrors;
}
