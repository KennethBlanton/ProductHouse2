// frontend/src/hooks/useAuthErrors.ts
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';

// Define possible error types for authentication
export type AuthErrorType = 
  | 'InvalidCredentials'
  | 'UserNotConfirmed'
  | 'UserNotFound'
  | 'NetworkError'
  | 'InvalidPassword'
  | 'EmailAlreadyExists'
  | 'PasswordRequirementsFailed'
  | 'Unknown';

// Error mapping for user-friendly messages
const ERROR_MESSAGES: Record<AuthErrorType, string> = {
  'InvalidCredentials': 'Incorrect username or password.',
  'UserNotConfirmed': 'Please confirm your account. Check your email for the confirmation link.',
  'UserNotFound': 'No account found with this username.',
  'NetworkError': 'Network error. Please check your connection and try again.',
  'InvalidPassword': 'The password you entered is incorrect.',
  'EmailAlreadyExists': 'An account with this email already exists.',
  'PasswordRequirementsFailed': 'Password does not meet security requirements.',
  'Unknown': 'An unexpected error occurred. Please try again.'
};

export function useAuthErrors() {
  const [error, setError] = useState<{
    type: AuthErrorType;
    message: string;
  } | null>(null);
  const toast = useToast();

  /**
   * Classify and set an authentication error
   * @param err Error object or message
   * @returns Classified error type
   */
  const handleError = (err: unknown): AuthErrorType => {
    const error = err as Error;
    let errorType: AuthErrorType = 'Unknown';

    // Classify specific Cognito error messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('incorrect username or password')) {
      errorType = 'InvalidCredentials';
    } else if (errorMessage.includes('user is not confirmed')) {
      errorType = 'UserNotConfirmed';
    } else if (errorMessage.includes('user does not exist')) {
      errorType = 'UserNotFound';
    } else if (errorMessage.includes('network')) {
      errorType = 'NetworkError';
    } else if (errorMessage.includes('password')) {
      errorType = 'InvalidPassword';
    } else if (errorMessage.includes('email already exists')) {
      errorType = 'EmailAlreadyExists';
    }

    // Set error state
    const friendlyMessage = ERROR_MESSAGES[errorType];
    setError({ type: errorType, message: friendlyMessage });

    // Show toast notification
    toast({
      title: 'Authentication Error',
      description: friendlyMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });

    return errorType;
  };

  /**
   * Clear the current error
   */
  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError,
    getErrorMessage: (type?: AuthErrorType) => 
      type ? ERROR_MESSAGES[type] : null
  };
}