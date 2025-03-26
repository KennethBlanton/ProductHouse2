import { useContext } from 'react';
import { useAuth as useAuthProvider, UserType } from '@/components/auth/AuthProvider';

/**
 * Custom hook for using authentication throughout the application
 * This hook wraps the context from AuthProvider for easier access
 */
export function useAuth() {
  const context = useAuthProvider();
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  
  return context;
}

export type { UserType };
export default useAuth;