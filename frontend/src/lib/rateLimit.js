// Simple in-memory rate limiting utility
const requestCounts = new Map();

export function rateLimit(userId, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create user's request history
  let userRequests = requestCounts.get(userId) || [];

  // Remove old requests outside the window
  userRequests = userRequests.filter((timestamp) => timestamp > windowStart);

  // Check if user has exceeded the limit
  if (userRequests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: windowStart + windowMs,
    };
  }

  // Add current request
  userRequests.push(now);
  requestCounts.set(userId, userRequests);

  // Clean up old entries to prevent memory leaks
  if (requestCounts.size > 1000) {
    const oldestAllowed = now - windowMs * 2;
    for (const [key, requests] of requestCounts.entries()) {
      if (requests.every((timestamp) => timestamp < oldestAllowed)) {
        requestCounts.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - userRequests.length,
    resetTime: windowStart + windowMs,
  };
}
