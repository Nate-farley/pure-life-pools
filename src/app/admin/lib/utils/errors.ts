/**
 * Custom Error Classes
 *
 * Provides typed error classes that map to HTTP status codes.
 * Used throughout the application for consistent error handling.
 */

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DUPLICATE_PHONE'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/**
 * Base application error class.
 * All custom errors extend this class.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation error - 400 Bad Request
 * Used when request body fails Zod validation or business rules.
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Unauthorized error - 401 Unauthorized
 * Used when authentication is missing or invalid.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error - 403 Forbidden
 * Used when user is authenticated but lacks permission.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Permission denied') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not found error - 404 Not Found
 * Used when a requested resource doesn't exist.
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error - 409 Conflict
 * Used for version mismatches or resource conflicts.
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

/**
 * Duplicate phone error - 409 Conflict
 * Specific error for duplicate phone number detection.
 */
export class DuplicatePhoneError extends AppError {
  readonly existingCustomerId: string | undefined;

  constructor(existingCustomerId?: string) {
    super('A customer with this phone number already exists', 'DUPLICATE_PHONE', 409, {
      existingCustomerId,
    });
    this.name = 'DuplicatePhoneError';
    this.existingCustomerId = existingCustomerId;
  }
}

/**
 * Rate limited error - 429 Too Many Requests
 * Used when user exceeds rate limits.
 */
export class RateLimitError extends AppError {
  readonly retryAfter: number;

  constructor(retryAfter: number) {
    super('Too many requests. Please try again later.', 'RATE_LIMITED', 429, {
      retryAfter,
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal error - 500 Internal Server Error
 * Used for unexpected server errors.
 */
export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 'INTERNAL_ERROR', 500);
    this.name = 'InternalError';
  }
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extracts a safe error message from any error type.
 * Prevents leaking internal details in production.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // In development, show the real error message
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }
    // In production, use a generic message
    return 'An unexpected error occurred';
  }

  return 'An unexpected error occurred';
}

/**
 * Gets the appropriate HTTP status code for an error.
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}
