'use client';

import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

type ForgotPasswordFormValues = {
  username: string;
};

export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>();
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setAuthError(null);
      await forgotPassword(data.username);
      setIsCodeSent(true);
      toast({
        title: 'Reset code sent',
        description: 'Please check your email for the password reset code',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Redirect to reset password page
      router.push(`/reset-password?username=${encodeURIComponent(data.username)}`);
    } catch (error) {
      const err = error as Error;
      setAuthError(err.message);
      toast({
        title: 'Failed to send reset code',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="md" py={12}>
        <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor={borderColor}>
          <Stack spacing={6}>
            <Heading textAlign="center" fontSize="2xl">
              Forgot Your Password?
            </Heading>

            <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
              Enter your username or email and we'll send you a code to reset your password.
            </Text>

            {authError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {authError}
              </Text>
            )}

            {isCodeSent ? (
              <Box textAlign="center">
                <Text color="green.500" mb={4}>
                  Reset code sent! Check your email for instructions.
                </Text>
                <Link href="/reset-password" passHref>
                  <Button variant="primary" width="full">
                    Continue to Reset Password
                  </Button>
                </Link>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={6}>
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel htmlFor="username">Username or Email</FormLabel>
                    <Input
                      id="username"
                      type="text"
                      {...register('username', {
                        required: 'Username or email is required',
                      })}
                    />
                    {errors.username && (
                      <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                  >
                    Send Reset Code
                  </Button>
                </Stack>
              </form>
            )}

            <Text align="center" fontSize="sm">
              Remember your password?{' '}
              <Link href="/login" passHref>
                <Text as="span" color="brand.500" _hover={{ textDecoration: 'underline' }}>
                  Log in
                </Text>
              </Link>
            </Text>
          </Stack>
        </Box>
      </Container>
    </Flex>
  );
}