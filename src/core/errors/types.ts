/**
 * Public contract for Server Action responses.
 *
 * All Server Actions return an ActionResponse<T> so the client can perform
 * type narrowing with `if (response.ok)` and access either data or error safely.
 */

export const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  BUSINESS_RULE: "BUSINESS_RULE",
  UNEXPECTED: "UNEXPECTED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Field-level validation errors keyed by field path.
 * Example: { email: ["Correo inválido"], password: ["Mínimo 8 caracteres"] }
 */
export type FieldErrors = Record<string, string[]>;

export type ActionError = {
  code: ErrorCode;
  message: string;
  fieldErrors?: FieldErrors;
};

export type ActionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };
