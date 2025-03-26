// frontend/src/lib/rateLimiter.ts
export class RateLimiter {
    private limits: Map<string, { count: number; resetTime: number }> = new Map();
    
    /**
     * Check if an action is allowed based on rate limiting
     * @param key Unique identifier for the action (e.g., 'login_attempt')
     * @param maxAttempts Maximum number of attempts allowed
     * @param windowMs Time window in milliseconds
     * @returns Boolean indicating if the action is allowed
     */
    check(key: string, maxAttempts: number, windowMs: number): boolean {
      const now = Date.now();
      const entry = this.limits.get(key);
  
      // If no existing entry or window has passed, reset
      if (!entry || now > entry.resetTime) {
        this.limits.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }
  
      // If within window, check attempt count
      if (entry.count < maxAttempts) {
        this.limits.set(key, { 
          count: entry.count + 1, 
          resetTime: entry.resetTime 
        });
        return true;
      }
  
      return false;
    }
  
    /**
     * Reset rate limit for a specific key
     * @param key Unique identifier for the action
     */
    reset(key: string): void {
      this.limits.delete(key);
    }
  }
  
  // Create a singleton instance
  export const rateLimiter = new RateLimiter();