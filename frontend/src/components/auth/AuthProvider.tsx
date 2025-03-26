'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner, Center } from '@chakra-ui/react';

// Define types for user and auth context
export interface UserType {
  username: string;
  email: string;
  sub: string;
  attributes?: Record<string, any>;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  forgotPassword: (username: string) => Promise<any>;
  forgotPasswordSubmit: (username: string, code: string, newPassword: string) => Promise<any>;
  resendConfirmationCode: (username: string) => Promise<any>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
];

// Public routes that don't need redirection when authenticated
const publicAuthRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Auth provider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route is protected
  const isProtectedRoute = () => {
    return protectedRoutes.some(route => pathname?.startsWith(route));
  };

  // Check if the current route is a public auth route
  const isPublicAuthRoute = () => {
    return publicAuthRoutes.some(route => pathname === route);
  };

  // Check authentication status when the component mounts
  useEffect(() => {
    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
          setError(new Error('Sign in failed'));
          break;
      }
    });

    // Check current authenticated user
    const checkUser = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        
        // Format user data
        const formattedUser: UserType = {
          username: userData.username,
          email: userData.attributes.email,
          sub: userData.attributes.sub,
          attributes: userData.attributes,
        };
        
        setUser(formattedUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!loading) {
      if (isProtectedRoute() && !user) {
        // Redirect to login if trying to access protected route without authentication
        router.push('/login');
      } else if (isPublicAuthRoute() && user) {
        // Redirect to dashboard if already authenticated and trying to access auth routes
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // Authentication methods
  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await Auth.signIn(username, password);
      return result;
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await Auth.signOut();
      router.push('/login');
    } catch (error) {
      const err = error as Error;
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
      });
      return result;
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      return await Auth.confirmSignUp(username, code);
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      return await Auth.forgotPassword(username);
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordSubmit = async (username: string, code: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      return await Auth.forgotPasswordSubmit(username, code, newPassword);
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationCode = async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      return await Auth.resendSignUp(username);
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    confirmSignUp,
    forgotPassword,
    forgotPasswordSubmit,
    resendConfirmationCode,
  };

  // Show loading spinner while initializing auth
  if (loading && pathname !== '/' && isProtectedRoute()) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;