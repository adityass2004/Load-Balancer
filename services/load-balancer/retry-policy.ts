/**
 * Set of HTTP methods defined as idempotent by RFC 7231 / RFC 9110.
 * Idempotent requests can be safely retried without unintended side-effects:
 * - GET: Safe and idempotent (read-only)
 * - HEAD: Safe and idempotent (headers only)
 * - OPTIONS: Safe and idempotent (communication options)
 * - PUT: Idempotent replacement of resource state
 * - DELETE: Idempotent deletion of resource state
 */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

/**
 * Determines whether an HTTP method is idempotent and eligible for automatic retry.
 *
 * Non-idempotent methods:
 * - POST: Creates new resources, processes transactions/payments (NEVER auto-retry)
 * - PATCH: Applies partial modifications, may perform relative increments (NEVER auto-retry)
 * - Any unknown or custom method: Fails safe as non-idempotent
 *
 * @param method - The HTTP method string (case-insensitive)
 * @returns true if the method is idempotent and safe to retry; false otherwise
 */
export function isIdempotentMethod(method: string | null | undefined): boolean {
  if (!method) return false;
  const normalized = method.trim().toUpperCase();
  return IDEMPOTENT_METHODS.has(normalized);
}
