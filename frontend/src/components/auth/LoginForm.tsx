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
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/components/auth/AuthProvider';

type LoginFormValues = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();
  const { signIn } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setAuthError(null);
      await signIn(data.username, data.password);
      // Successful login will redirect to dashboard via AuthProvider
    } catch (error) {
      const err = error as Error;
      setAuthError(err.message);
      toast({
        title: 'Login failed',
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
              Log in to your account
            </Heading>

            {authError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {authError}
              </Text>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel htmlFor="username">Email or Username</FormLabel>
                  <Input
                    id="username"
                    type="text"
                    {...register('username', {
                      required: 'Email or username is required',
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
                  {errors.password && (
                    <FormErrorMessage>{errors.password.message}</FormErrorMessage>
                  )}
                </FormControl>

                <Stack spacing={6}>
                  <Box textAlign="right">
                    <Link href="/forgot-password" passHref>
                      <Text color="brand.500" fontSize="sm" _hover={{ textDecoration: 'underline' }}>
                        Forgot password?
                      </Text>
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText="Logging in..."
                  >
                    Log in
                  </Button>
                </Stack>
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
                  // OAuth login - to be implemented
                  toast({
                    title: 'Feature not implemented',
                    description: 'OAuth login is coming soon',
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
                  // OAuth login - to be implemented
                  toast({
                    title: 'Feature not implemented',
                    description: 'OAuth login is coming soon',
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
              Don&apos;t have an account?{' '}
              <Link href="/register" passHref>
                <Text as="span" color="brand.500" _hover={{ textDecoration: 'underline' }}>
                  Sign up
                </Text>
              </Link>
            </Text>
          </Stack>
        </Box>
      </Container>
    </Flex>
  );
}