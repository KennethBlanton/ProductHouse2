// frontend/src/lib/authLogger.ts
import apiClient from './api';

export interface AuthLogEntry {
  userId?: string;
  action: 'LOGIN' | 'LOGOUT' | 'SIGNUP' | 'PASSWORD_RESET' | 'MFA_ENABLED' | 'MFA_DISABLED' | 'PROFILE_UPDATE';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export class AuthLogger {
  /**
   * Log an authentication event
   * @param entry Authentication log entry
   */
  static async log(entry: AuthLogEntry): Promise<void> {
    try {
      // In a real-world scenario, this would be an API call to log the event
      await apiClient.logAuthEvent({
        ...entry,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getIPAddress(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      // Optionally log to console if API logging fails
      console.error('Failed to log authentication event', error);
    }
  }

  /**
   * Get user's IP address
   * @returns Promise resolving to IP address
   */
  private static async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Create a log entry for login attempt
   * @param userId User identifier
   * @param success Whether login was successful
   * @param errorMessage Optional error message
   */
  static async logLogin(userId: string | undefined, success: boolean, errorMessage?: string): Promise<void> {
    await this.log({
      userId,
      action: 'LOGIN',
      success,
      errorMessage
    });
  }

  /**
   * Create a log entry for signup
   * @param userId User identifier
   * @param success Whether signup was successful
   * @param errorMessage Optional error message
   */
  static async logSignup(userId: string | undefined, success: boolean, errorMessage?: string): Promise<void> {
    await this.log({
      userId,
      action: 'SIGNUP',
      success,
      errorMessage
    });
  }

  // Additional logging methods for other auth actions...
}