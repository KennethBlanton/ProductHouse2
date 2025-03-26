'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import theme from '@/theme';
import AuthProvider from '@/components/auth/AuthProvider';

// AWS Amplify configuration
const awsConfig = {
  Auth: {
    region: process.env.NEXT_PUBLIC_REGION,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
    mandatorySignIn: true,
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.NEXT_PUBLIC_API_URL,
        region: process.env.NEXT_PUBLIC_REGION,
      },
    ],
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for React Query
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  // Configure AWS Amplify on the client-side only
  useEffect(() => {
    Amplify.configure(awsConfig);
  }, []);

  return (
    <CacheProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}