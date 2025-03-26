'use client';

import {
  Box,
  Button,
  Container,
  Divider,
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/components/auth/AuthProvider';

type RegisterFormValues = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();
  const { signUp } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConfirmationRequired, setIsConfirmationRequired] = useState(false);

  const password = watch('password');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setAuthError(null);
      await signUp(data.username, data.password, data.email);
      setIsConfirmationRequired(true);
      toast({
        title: 'Registration successful',
        description: 'Please check your email for a confirmation code.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Redirect to confirmation page
      router.push(`/confirm-registration?username=${encodeURIComponent(data.username)}`);
    } catch (error) {
      const err = error as Error;
      setAuthError(err.message);
      toast({
        title: 'Registration failed',
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
              Create your account
            </Heading>

            {authError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {authError}
              </Text>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <FormErrorMessage>{errors.email.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.username}>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <Input
                    id="username"
                    type="text"
                    {...register('username', {
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters',
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9._-]+$/,
                        message: 'Username can only contain letters, numbers, and ._-',
                      },
                    })}
                  />
                  {errors.username && (
                    <FormErrorMessage>{errors.username.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
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
                  {errors.password ? (
                    <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                  ) : (
                    <FormHelperText>
                      Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
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
                  loadingText="Creating account..."
                >
                  Sign up
                </Button>
              </Stack>
            </form>

            <Flex align="center" justify="center">
              <Divider flex="1" />
              <Text px={3} color="gray.500" fontSize="sm">
                Or continue with
              </Text>
              <Divider flex="1" />
            </Flex>

            <Stack direction="row" spacing={4} justify="center">
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGoogle />}
                onClick={() => {
                  // OAuth registration - to be implemented
                  toast({
                    title: 'Feature not implemented',
                    description: 'OAuth registration is coming soon',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                Google
              </Button>
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGithub />}
                onClick={() => {
                  // OAuth registration - to be implemented
                  toast({
                    title: 'Feature not implemented',
                    description: 'OAuth registration is coming soon',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                }}
              >
                GitHub
              </Button>
            </Stack>

            <Text align="center" fontSize="sm">
              Already have an account?{' '}
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