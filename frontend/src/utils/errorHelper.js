/**
 * Extracts a safe, renderable error message from Axios error responses.
 * Handles FastAPI's 422 validation errors (array of objects) and standard errors (string).
 */
export function getErrorMessage(err, fallback = 'Something went wrong') {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
  }
  return fallback;
}
