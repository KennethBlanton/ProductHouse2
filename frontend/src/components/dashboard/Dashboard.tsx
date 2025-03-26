'use client';

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Button,
  Flex,
  Icon,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  Progress,
  Badge,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { MdAdd, MdApps, MdAutoGraph, MdArrowForward } from 'react-icons/md';

// Temporary mock data (will be replaced with API calls)
const mockProjects = [
  {
    id: '1',
    name: 'Mobile Banking App',
    status: 'In Progress',
    progress: 65,
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    name: 'E-commerce Platform',
    status: 'Planning',
    progress: 25,
    lastUpdated: 'Yesterday',
  },
  {
    id: '3',
    name: 'Fitness Tracker',
    status: 'Completed',
    progress: 100,
    lastUpdated: '1 week ago',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(mockProjects);
  const [isLoading, setIsLoading] = useState(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statCardBg = useColorModeValue('brand.50', 'brand.900');
  
  // Simulate API call to fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      // In a real implementation, this would be an API call
      setTimeout(() => {
        setProjects(mockProjects);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchProjects();
  }, []);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'In Progress':
        return 'blue';
      case 'Planning':
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Welcome back, {user?.username || 'Developer'}</Heading>
          <Text mt={1} color="gray.500">
            Here's an overview of your projects and development activities
          </Text>
        </Box>
        
        <Link href="/projects/new" passHref>
          <Button leftIcon={<MdAdd />} variant="primary">
            New Project
          </Button>
        </Link>
      </Flex>
      
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card bg={statCardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Total Projects</StatLabel>
              <StatNumber>{isLoading ? '-' : projects.length}</StatNumber>
              <StatHelpText>
                {isLoading ? 'Loading...' : `${projects.filter(p => p.status === 'In Progress').length} in progress`}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={statCardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Average Completion</StatLabel>
              <StatNumber>
                {isLoading
                  ? '-'
                  : `${Math.round(
                      projects.reduce((acc, project) => acc + project.progress, 0) / projects.length
                    )}%`}
              </StatNumber>
              <StatHelpText>Based on all projects</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={statCardBg} border="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Completed Projects</StatLabel>
              <StatNumber>
                {isLoading ? '-' : projects.filter(p => p.status === 'Completed').length}
              </StatNumber>
              <StatHelpText>
                {isLoading
                  ? 'Loading...'
                  : `${Math.round(
                      (projects.filter(p => p.status === 'Completed').length / projects.length) * 100
                    )}% completion rate`}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Recent Projects */}
      <Card mb={8} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={MdApps} fontSize="xl" color="brand.500" />
              <Heading size="md">Recent Projects</Heading>
            </HStack>
            
            <Link href="/projects" passHref>
              <Button variant="ghost" rightIcon={<MdArrowForward />} size="sm">
                View All
              </Button>
            </Link>
          </Flex>
        </CardHeader>
        
        <CardBody>
          {isLoading ? (
            <Text>Loading projects...</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} passHref>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={borderColor}
                    _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                    transition="all 0.2s"
                  >
                    <Flex justify="space-between" align="center" mb={2}>
                      <Heading size="sm">{project.name}</Heading>
                      <Badge colorScheme={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </Flex>
                    <Progress
                      value={project.progress}
                      size="sm"
                      colorScheme={project.progress === 100 ? 'green' : 'blue'}
                      mb={2}
                      borderRadius="full"
                    />
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {project.progress}% complete
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Updated {project.lastUpdated}
                      </Text>
                    </Flex>
                  </Box>
                </Link>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
      
      {/* Quick Actions */}
      <Card border="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack>
            <Icon as={MdAutoGraph} fontSize="xl" color="brand.500" />
            <Heading size="md">Quick Actions</Heading>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Button variant="outline" leftIcon={<MdAdd />} size="lg" height="100px">
              <VStack>
                <Text>Create Project</Text>
                <Text fontSize="xs" color="gray.500">
                  Start a new app development project
                </Text>
              </VStack>
            </Button>
            
            <Button variant="outline" size="lg" height="100px">
              <VStack>
                <Text>Browse Templates</Text>
                <Text fontSize="xs" color="gray.500">
                  Use pre-built project templates
                </Text>
              </VStack>
            </Button>
            
            <Button variant="outline" size="lg" height="100px">
              <VStack>
                <Text>Explore Tutorials</Text>
                <Text fontSize="xs" color="gray.500">
                  Learn how to use the platform
                </Text>
              </VStack>
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
}