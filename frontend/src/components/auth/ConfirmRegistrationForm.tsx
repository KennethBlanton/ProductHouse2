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
  PinInput,
  PinInputField,
  HStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';

type ConfirmRegistrationFormValues = {
  username: string;
  code: string;
};

export default function ConfirmRegistrationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmRegistrationFormValues>();
  
  const searchParams = useSearchParams();
  const usernameFromQuery = searchParams.get('username') || '';
  
  const { confirmSignUp, resendConfirmationCode } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Set username from query params
  useEffect(() => {
    if (usernameFromQuery) {
      setValue('username', usernameFromQuery);
    }
  }, [usernameFromQuery, setValue]);

  // Update form value when verification code changes
  useEffect(() => {
    setValue('code', verificationCode.join(''));
  }, [verificationCode, setValue]);

  const handlePinChange = (index: number) => (value: string) => {
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);
  };

  const onSubmit = async (data: ConfirmRegistrationFormValues) => {
    try {
      setAuthError(null);
      await confirmSignUp(data.username, data.code);
      toast({
        title: 'Account confirmed',
        description: 'Your account has been successfully confirmed. You can now log in.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
    } catch (error) {
      const err = error as Error;
      setAuthError(err.message);
      toast({
        title: 'Confirmation failed',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResendCode = async () => {
    if (!usernameFromQuery) {
      toast({
        title: 'Username required',
        description: 'Please enter your username to resend the confirmation code.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsResending(true);
      await resendConfirmationCode(usernameFromQuery);
      toast({
        title: 'Code resent',
        description: 'A new confirmation code has been sent to your email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Failed to resend code',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Container maxW="md" py={12}>
        <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md" borderWidth="1px" borderColor={borderColor}>
          <Stack spacing={6}>
            <Heading textAlign="center" fontSize="2xl">
              Confirm Your Account
            </Heading>

            <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
              We sent a confirmation code to your email. Please enter the code below to verify your account.
            </Text>

            {authError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {authError}
              </Text>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={6}>
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
                  <HStack justify="center" mb={4}>
                    <PinInput otp size="lg">
                      {verificationCode.map((_, index) => (
                        <PinInputField
                          key={index}
                          value={verificationCode[index]}
                          onChange={(e) => {
                            const newCode = [...verificationCode];
                            newCode[index] = e.target.value;
                            setVerificationCode(newCode);
                          }}
                        />
                      ))}
                    </PinInput>
                  </HStack>
                  <Input
                    id="code"
                    type="hidden"
                    {...register('code', {
                      required: 'Verification code is required',
                      minLength: {
                        value: 6,
                        message: 'Verification code must be 6 digits',
                      },
                    })}
                  />
                  {errors.code && (
                    <FormErrorMessage textAlign="center">{errors.code.message}</FormErrorMessage>
                  )}
                </FormControl>

                <Stack spacing={4}>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText="Confirming..."
                  >
                    Confirm Account
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleResendCode}
                    isLoading={isResending}
                    loadingText="Resending..."
                  >
                    Resend Code
                  </Button>
                </Stack>
              </Stack>
            </form>

            <Text align="center" fontSize="sm">
              Already confirmed?{' '}
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
