/**
 * Numeric limits shared by Zod schemas and HTML input attributes (maxLength, etc.).
 */

export const PROJECT_NAME_MIN_LEN = 3;
export const PROJECT_NAME_MAX_LEN = 80;
export const PROJECT_DESCRIPTION_MAX_LEN = 500;

export const TASK_NAME_MIN_LEN = 3;
export const TASK_NAME_MAX_LEN = 120;

export const USER_REGISTER_NAME_MIN_LEN = 2;
export const USER_REGISTER_NAME_MAX_LEN = 80;

/** Practical upper bound for email addresses (RFC-aligned). */
export const EMAIL_MAX_LEN = 254;

export const PASSWORD_MIN_LEN = 8;
/** bcrypt uses at most 72 bytes; keeps server work bounded. */
export const PASSWORD_MAX_LEN = 72;
