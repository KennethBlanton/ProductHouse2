import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { useRouter, usePathname } from 'next/navigation';
import { Spinner, Center, useToast } from '@chakra-ui/react';

// Enhanced User Type
export interface UserType {
  username: string;
  email: string;
  sub: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  attributes?: Record<string, any>;
}

// Enhanced Auth Context Type
interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  error: Error | null;
  signIn: (username: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signUp: (userData: {
    username: string, 
    password: string, 
    email: string,
    firstName?: string,
    lastName?: string
  }) => Promise<any>;
  confirmSignUp: (username: string, code: string) => Promise<any>;
  forgotPassword: (username: string) => Promise<any>;
  forgotPasswordSubmit: (username: string, code: string, newPassword: string) => Promise<any>;
  resendConfirmationCode: (username: string) => Promise<any>;
  updateProfile: (userData: Partial<UserType>) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
  enableMFA: () => Promise<any>;
  disableMFA: () => Promise<any>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  return context;
};

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/profile',
  '/settings',
];

// Public routes that don't need redirection when authenticated
const publicAuthRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/confirm-registration',
];

// Auth provider component
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

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
        const userData = await Auth.currentAuthenticatedUser({
          bypassCache: true  // Ensures we get the latest user data
        });
        
        // Format user data
        const formattedUser: UserType = {
          username: userData.username,
          email: userData.attributes.email,
          sub: userData.attributes.sub,
          firstName: userData.attributes.given_name,
          lastName: userData.attributes.family_name,
          profilePicture: userData.attributes.picture,
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

  const signUp = async (userData: {
    username: string, 
    password: string, 
    email: string,
    firstName?: string,
    lastName?: string
  }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await Auth.signUp({
        username: userData.username,
        password: userData.password,
        attributes: {
          email: userData.email,
          given_name: userData.firstName,
          family_name: userData.lastName,
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

  // Update user profile
  const updateProfile = async (userData: Partial<UserType>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user
      const currentUser = await Auth.currentAuthenticatedUser();
      
      // Prepare attributes to update
      const attributes: Record<string, string> = {};
      if (userData.firstName) attributes.given_name = userData.firstName;
      if (userData.lastName) attributes.family_name = userData.lastName;
      if (userData.email) attributes.email = userData.email;
      
      // Update user attributes
      await Auth.updateUserAttributes(currentUser, attributes);
      
      // Refresh user data
      await checkUser();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      setError(err);
      
      toast({
        title: 'Update Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(currentUser, oldPassword, newPassword);
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      setError(err);
      
      toast({
        title: 'Password Change Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.deleteUser(currentUser);
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      const err = error as Error;
      setError(err);
      
      toast({
        title: 'Account Deletion Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Enable Multi-Factor Authentication
  const enableMFA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.setupTOTP(currentUser);
      
      toast({
        title: 'MFA Setup',
        description: 'Multi-Factor Authentication has been enabled.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      setError(err);
      
      toast({
        title: 'MFA Setup Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Disable Multi-Factor Authentication
  const disableMFA = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.disableMFA(currentUser);
      
      toast({
        title: 'MFA Disabled',
        description: 'Multi-Factor Authentication has been disabled.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      setError(err);
      
      toast({
        title: 'MFA Disable Failed',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      
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
    updateProfile,
    changePassword,
    deleteAccount,
    enableMFA,
    disableMFA,
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
