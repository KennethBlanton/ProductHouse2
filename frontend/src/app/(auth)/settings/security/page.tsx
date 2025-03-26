// frontend/src/app/(auth)/settings/security/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useColorModeValue,
  Flex,
  FormErrorMessage,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Stack,
  HStack,
  Switch,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
} from '@chakra-ui/react';
import { 
  MdLock, 
  MdSecurity, 
  MdVpnKey,
  MdDesktopWindows,
  MdPhoneIphone,
} from 'react-icons/md';
import { useForm } from 'react-hook-form';
import useAuth from '@/components/auth/AuthProvider';
import { DeviceManager, DeviceInfo } from '@/lib/deviceManagement';

// Type for password change form
type PasswordChangeFormData = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function SecuritySettingsPage() {
  const { 
    changePassword, 
    enableMFA, 
    disableMFA, 
    user 
  } = useAuth();
  const toast = useToast();
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);

  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<PasswordChangeFormData>();

  // Load devices on component mount
  useEffect(() => {
    if (user) {
      const trackedDevices = DeviceManager.getTrackedDevices(user.sub);
      setDevices(trackedDevices);
    }
  }, [user]);

  // Password change handler
  const onPasswordChangeSubmit = async (data: PasswordChangeFormData) => {
    // Validate new password
    if (data.newPassword !== data.confirmNewPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await changePassword(data.currentPassword, data.newPassword);
      reset(); // Clear form after successful password change
    } catch (error) {
      // Error handling is done in the changePassword method
    }
  };

  // Remove a device
  const handleRemoveDevice = (deviceId: string) => {
    if (user) {
      DeviceManager.removeDevice(user.sub, deviceId);
      setDevices(prev => prev.filter(device => device.id !== deviceId));
    }
  };

  // MFA toggle handler
  const handleMFAToggle = async () => {
    try {
      if (isMFAEnabled) {
        await disableMFA();
        setIsMFAEnabled(false);
      } else {
        await enableMFA();
        setIsMFAEnabled(true);
      }
    } catch (error) {
      // Error handling is done in the enableMFA/disableMFA methods
    }
  };

  return (
    <Box>
      <Heading mb={6}>Security Settings</Heading>
      
      <Stack spacing={6} direction={{ base: 'column', md: 'row' }}>
        {/* Password Change Card */}
        <Card flex={1} borderWidth="1px">
          <CardHeader>
            <HStack>
              <MdLock />
              <Heading size="md">Change Password</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(onPasswordChangeSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.currentPassword}>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type="password"
                    {...register('currentPassword', {
                      required: 'Current password is required',
                    })}
                    placeholder="Enter current password"
                  />
                  {errors.currentPassword && (
                    <FormErrorMessage>{errors.currentPassword.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.newPassword}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type="password"
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: 'Password must include uppercase, lowercase, number, and special character'
                      }
                    })}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <FormErrorMessage>{errors.newPassword.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!errors.confirmNewPassword}>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    type="password"
                    {...register('confirmNewPassword', {
                      required: 'Please confirm your new password',
                      validate: (value) => 
                        value === watch('newPassword') || 'Passwords do not match'
                    })}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmNewPassword && (
                    <FormErrorMessage>{errors.confirmNewPassword.message}</FormErrorMessage>
                  )}
                </FormControl>

                <Button 
                  type="submit" 
                  variant="primary" 
                  width="full" 
                  isLoading={isSubmitting}
                >
                  Change Password
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {/* Multi-Factor Authentication Card */}
        <Card flex={1} borderWidth="1px">
          <CardHeader>
            <HStack>
              <MdSecurity />
              <Heading size="md">Multi-Factor Authentication</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">Enable MFA</Text>
                  <Text fontSize="sm" color="gray.500">
                    Add an extra layer of security to your account
                  </Text>
                </VStack>
                <Switch
                  colorScheme="brand"
                  isChecked={isMFAEnabled}
                  onChange={handleMFAToggle}
                />
              </Flex>

              {isMFAEnabled ? (
                <Alert status="success" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>MFA Enabled</AlertTitle>
                    <AlertDescription>
                      Your account has an additional layer of security.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>MFA Disabled</AlertTitle>
                    <AlertDescription>
                      Enable Multi-Factor Authentication to protect your account.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              <Button 
                leftIcon={<MdVpnKey />} 
                variant="outline" 
                width="full"
              >
                Manage Authentication Methods
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Stack>

      {/* Active Devices Card */}
      <Card mt={6} borderWidth="1px">
        <CardHeader>
          <HStack>
            <MdSecurity />
            <Heading size="md">Active Devices</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {devices.map(device => (
              <Flex 
                key={device.id} 
                justify="space-between" 
                align="center" 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
              >
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{device.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Last active: {new Date(device.lastActive).toLocaleString()}
                  </Text>
                </VStack>
                <Button 
                  size="sm" 
                  variant="outline" 
                  colorScheme="red"
                  onClick={() => handleRemoveDevice(device.id)}
                >
                  Remove Device
                </Button>
              </Flex>
            ))}
            
            {devices.length === 0 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text>No active devices found.</Text>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
