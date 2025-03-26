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
  IconButton,
  InputGroup,
  InputRightElement,
  FormHelperText,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/components/auth/AuthProvider';

type ResetPasswordFormValues = {
  username: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();
  
  const searchParams = useSearchParams();
  const usernameFromQuery = searchParams.get('username') || '';
  
  const { forgotPasswordSubmit } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  const password = watch('newPassword');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Set username from query params
  useEffect(() => {
    if (usernameFromQuery) {
      setValue('username', usernameFromQuery);
    }
  }, [usernameFromQuery, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      setAuthError(null);
      await forgotPasswordSubmit(data.username, data.code, data.newPassword);
      setIsResetSuccessful(true);
      toast({
        title: 'Password reset successful',
        description: 'Your password has been reset successfully. You can now log in with your new password.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      setAuthError(err.message);
      toast({
        title: 'Password reset failed',
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
              Reset Your Password
            </Heading>

            {authError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {authError}
              </Text>
            )}

            {isResetSuccessful ? (
              <Box textAlign="center">
                <Text color="green.500" mb={4}>
                  Your password has been reset successfully!
                </Text>
                <Link href="/login" passHref>
                  <Button variant="primary" width="full">
                    Log in with New Password
                  </Button>
                </Link>
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={4}>
                  <FormControl isInvalid={!!errors.username}>
                    <FormLabel htmlFor="username">Username</FormLabel>
                    <Input
                      id="username"
                      type="text"
                      readOnly={!!usernameFromQuery}
                      {...register('username', {
                        required: 'Username is required',
                      })}
                    />
                    {errors.username && (
                      <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.code}>
                    <FormLabel htmlFor="code">Verification Code</FormLabel>
                    <Input
                      id="code"
                      type="text"
                      {...register('code', {
                        required: 'Verification code is required',
                      })}
                    />
                    {errors.code && (
                      <FormErrorMessage>{errors.code.message}</FormErrorMessage>
                    )}
                    <FormHelperText>
                      Enter the verification code we sent to your email.
                    </FormHelperText>
                  </FormControl>

                  <FormControl isInvalid={!!errors.newPassword}>
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                            message:
                              'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                          },
                        })}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.newPassword ? (
                      <FormErrorMessage>{errors.newPassword.message}</FormErrorMessage>
                    ) : (
                      <FormHelperText>
                        Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                      </FormHelperText>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.confirmPassword}>
                    <FormLabel htmlFor="confirmPassword">Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          required: 'Please confirm your new password',
                          validate: (value) =>
                            value === password || 'Passwords do not match',
                        })}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                    {errors.confirmPassword && (
                      <FormErrorMessage>{errors.confirmPassword.message}</FormErrorMessage>
                    )}
                  </FormControl>

                  <Button
                    type="submit"
                    variant="primary"
                    mt={6}
                    isLoading={isSubmitting}
                    loadingText="Resetting password..."
                  >
                    Reset Password
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