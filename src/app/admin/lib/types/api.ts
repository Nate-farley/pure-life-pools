/**
 * Standard error codes used throughout the application.
 * Maps to HTTP status codes for API responses.
 */
export type ErrorCode =
  | 'VALIDATION_ERROR' // 400 - Invalid input
  | 'UNAUTHORIZED' // 401 - Not authenticated
  | 'FORBIDDEN' // 403 - Not authorized (not admin)
  | 'NOT_FOUND' // 404 - Resource doesn't exist
  | 'CONFLICT' // 409 - Resource conflict (duplicate, version mismatch)
  | 'DUPLICATE_PHONE' // 409 - Phone number already exists
  | 'RATE_LIMITED' // 429 - Too many requests
  | 'INTERNAL_ERROR'; // 500 - Server error

/**
 * Standard result type for all server actions and API calls.
 * Enforces consistent success/error handling across the application.
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ErrorCode };


/**
 * Creates a successful action result.
 */
export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Creates a failed action result.
 */
export function errorResult<T>(error: string, code?: string): ActionResult<T> {
  return { success: false, error, code };
}



/**
 * Pagination parameters for list endpoints.
 * Uses cursor-based pagination for stable results.
 */
export interface PaginationParams {
  /** Number of items per page (default: 25, max: 100) */
  limit?: number;
  /** Encoded cursor for next/previous page */
  cursor?: string;
  /** Pagination direction */
  direction?: 'next' | 'prev';
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}


/**
 * Paginated response wrapper.
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Whether more items exist after this page */
  hasMore: boolean;
  /** Cursor for fetching the next page (null if no more) */
  nextCursor: string | null;
  /** Total count of items (optional, expensive for large datasets) */
  totalCount?: number;
}

/**
 * Standard API response metadata.
 */
export interface ResponseMeta {
  /** ISO timestamp of the response */
  timestamp: string;
  /** Unique request identifier for debugging */
  requestId?: string;
}

/**
 * Helper to create a success result.
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * Helper to create an error result.
 */
export function failure<T>(error: string, code?: ErrorCode): ActionResult<T> {
  if (code !== undefined) {
    return { success: false, error, code };
  }
  return { success: false, error };
}


/**
 * Success result from a server action or API call.
 */
export interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * Error result from a server action or API call.
 */
export interface ErrorResult {
  success: false;
  error: string;
  code?: ErrorCode;
  details?: Record<string, unknown>;
}

/**
 * Type guard to check if result is successful.
 */
export function isSuccess<T>(result: ActionResult<T>): result is SuccessResult<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is an error.
 */
export function isError<T>(result: ActionResult<T>): result is ErrorResult {
  return result.success === false;
}

/**
 * Pagination parameters for list endpoints.
 */
export interface PaginationParams {
  limit?: number;
  cursor?: string | null;
  direction?: 'next' | 'prev';
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  prevCursor: string | null;
  total?: number;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Creates a success response object.
 */
export function successResponse<T>(data: T): SuccessResult<T> {
  return { success: true, data };
}

/**
 * Creates an error response object.
 */
export function errorResponse(
  error: string,
  code?: ErrorCode,
  details?: Record<string, unknown>
): ErrorResult {
  return {
    success: false,
    error,
    code,
    details,
  };
}

/**
 * Standard error codes used across the application.
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DUPLICATE: 'DUPLICATE',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;


/**
 * Application error class for consistent error handling.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }

  static validation(message: string): AppError {
    return new AppError(message, ErrorCodes.VALIDATION_ERROR, 400);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, ErrorCodes.UNAUTHORIZED, 401);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, ErrorCodes.FORBIDDEN, 403);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError(message, ErrorCodes.NOT_FOUND, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, ErrorCodes.CONFLICT, 409);
  }

  static duplicate(message: string): AppError {
    return new AppError(message, ErrorCodes.DUPLICATE, 409);
  }
}

/**
 * Type guard to check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extracts a user-friendly error message from any error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
