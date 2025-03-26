'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  Textarea,
  Select,
  Stack,
  useColorModeValue,
  Alert,
  AlertIcon,
  HStack,
  Text,
  Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { useProjects, ProjectData } from '@/hooks/useProjects';

export default function NewProjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectData>();
  const { createProject } = useProjects();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const onSubmit = async (data: ProjectData) => {
    try {
      setError(null);
      const project = await createProject(data);
      if (project) {
        router.push(`/projects/${project.id}/refine`);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <Box>
      <HStack mb={6} spacing={4}>
        <Link href="/projects" passHref>
          <Button variant="ghost" leftIcon={<MdArrowBack />}>
            Back to Projects
          </Button>
        </Link>
        <Heading size="lg">Create New Project</Heading>
      </HStack>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      
      <Card borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Project Information</Heading>
          <Text mt={1} color="gray.500">
            Enter the basic details for your new app development project
          </Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={6}>
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel htmlFor="name">Project Name</FormLabel>
                <Input
                  id="name"
                  {...register('name', {
                    required: 'Project name is required',
                    minLength: {
                      value: 3,
                      message: 'Project name must be at least 3 characters',
                    },
                    maxLength: {
                      value: 50,
                      message: 'Project name must be less than 50 characters',
                    },
                  })}
                  placeholder="Enter a name for your project"
                />
                {errors.name ? (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                ) : (
                  <FormHelperText>
                    Choose a clear and descriptive name for your project
                  </FormHelperText>
                )}
              </FormControl>
              
              <FormControl isInvalid={!!errors.description}>
                <FormLabel htmlFor="description">Project Description</FormLabel>
                <Textarea
                  id="description"
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description must be less than 500 characters',
                    },
                  })}
                  placeholder="Describe your project in a few sentences"
                  rows={4}
                />
                {errors.description ? (
                  <FormErrorMessage>{errors.description.message}</FormErrorMessage>
                ) : (
                  <FormHelperText>
                    Briefly describe what your application will do
                  </FormHelperText>
                )}
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="status">Project Status</FormLabel>
                <Select
                  id="status"
                  {...register('status')}
                  defaultValue="Planning"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </Select>
                <FormHelperText>
                  Select the current status of your project
                </FormHelperText>
              </FormControl>
              
              <HStack spacing={4} justify="flex-end">
                <Link href="/projects" passHref>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  loadingText="Creating..."
                >
                  Create Project
                </Button>
              </HStack>
            </Stack>
          </form>
        </CardBody>
      </Card>
      
      <Card mt={8} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">What happens next?</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <Text>
              After creating your project, you'll be guided through the following steps:
            </Text>
            <HStack align="start" spacing={4}>
              <Box
                bg="brand.50"
                color="brand.500"
                p={2}
                borderRadius="md"
                fontWeight="bold"
              >
                1
              </Box>
              <Box>
                <Text fontWeight="bold">Refine Your Idea</Text>
                <Text color="gray.500">
                  Engage in a conversation with Claude to refine your app concept and identify key features.
                </Text>
              </Box>
            </HStack>
            <HStack align="start" spacing={4}>
              <Box
                bg="brand.50"
                color="brand.500"
                p={2}
                borderRadius="md"
                fontWeight="bold"
              >
                2
              </Box>
              <Box>
                <Text fontWeight="bold">Generate Master Plan</Text>
                <Text color="gray.500">
                  Claude will create a structured development plan with epics, user stories, and timelines.
                </Text>
              </Box>
            </HStack>
            <HStack align="start" spacing={4}>
              <Box
                bg="brand.50"
                color="brand.500"
                p={2}
                borderRadius="md"
                fontWeight="bold"
              >
                3
              </Box>
              <Box>
                <Text fontWeight="bold">Integrate with Project Management</Text>
                <Text color="gray.500">
                  Connect with tools like Jira, Asana, or GitHub Projects to track progress.
                </Text>
              </Box>
            </HStack>
            <HStack align="start" spacing={4}>
              <Box
                bg="brand.50"
                color="brand.500"
                p={2}
                borderRadius="md"
                fontWeight="bold"
              >
                4
              </Box>
              <Box>
                <Text fontWeight="bold">Development Support</Text>
                <Text color="gray.500">
                  Get AI-powered coding assistance and documentation throughout the development process.
                </Text>
              </Box>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}