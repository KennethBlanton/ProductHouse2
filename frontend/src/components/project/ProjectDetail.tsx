'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link as ChakraLink,
  Progress,
  SimpleGrid,
  Spinner,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdEdit, MdDelete, MdMoreVert, MdMessage, MdAutoGraph, MdCode, MdOutlineRocketLaunch } from 'react-icons/md';
import { useProjects, Project } from '@/hooks/useProjects';

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { getProject, isLoading, error, deleteProject } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const router = useRouter();
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    const fetchProject = async () => {
      const projectData = await getProject(projectId);
      if (projectData) {
        setProject(projectData);
      }
    };
    
    fetchProject();
  }, [projectId, getProject]);
  
  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const success = await deleteProject(projectId);
      if (success) {
        router.push('/projects');
      }
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'In Progress':
        return 'blue';
      case 'Planning':
        return 'orange';
      case 'On Hold':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>Error loading project: {error.message}</Text>
      </Alert>
    );
  }
  
  if (!project) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Text>Project not found</Text>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Link href="/projects" passHref>
            <Button variant="ghost" leftIcon={<MdArrowBack />}>
              All Projects
            </Button>
          </Link>
          <Heading size="lg">{project.name}</Heading>
          <Badge colorScheme={getStatusColor(project.status)} fontSize="0.8em" py={1} px={2}>
            {project.status}
          </Badge>
        </HStack>
        
        <HStack spacing={2}>
          <Link href={`/projects/${projectId}/edit`} passHref>
            <Button leftIcon={<MdEdit />} variant="outline">
              Edit Project
            </Button>
          </Link>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<MdMoreVert />}
              variant="ghost"
              aria-label="More options"
            />
            <MenuList>
              <MenuItem onClick={handleDeleteProject} icon={<MdDelete />} color="red.500">
                Delete Project
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Progress</StatLabel>
              <StatNumber>{project.progress}%</StatNumber>
              <Progress
                value={project.progress}
                size="sm"
                colorScheme={getStatusColor(project.status)}
                mt={2}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Creation Date</StatLabel>
              <StatNumber>
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Last Updated</StatLabel>
              <StatNumber>{project.lastUpdated}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Project Description</Heading>
        </CardHeader>
        <CardBody>
          <Text>{project.description || 'No description provided.'}</Text>
        </CardBody>
      </Card>
      
      <Tabs colorScheme="brand" mb={6} isLazy>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Plan</Tab>
          <Tab>Development</Tab>
          <Tab>Deployment</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={MdMessage} color="brand.500" />
                    <Heading size="md">Idea Refinement</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Text>
                      Refine your app concept through a guided conversation with Claude.
                    </Text>
                    <Link href={`/projects/${projectId}/refine`} passHref>
                      <Button rightIcon={<Icon as={MdArrowBack} transform="rotate(180deg)" />}>
                        Start Refinement
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={MdAutoGraph} color="brand.500" />
                    <Heading size="md">Master Plan</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Text>
                      Generate a comprehensive development plan with epics and user stories.
                    </Text>
                    <Link href={`/projects/${projectId}/plan`} passHref>
                      <Button rightIcon={<Icon as={MdArrowBack} transform="rotate(180deg)" />}>
                        Generate Plan
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={MdCode} color="brand.500" />
                    <Heading size="md">Development Support</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Text>
                      Get AI-powered coding assistance and documentation generation.
                    </Text>
                    <Link href={`/projects/${projectId}/develop`} passHref>
                      <Button rightIcon={<Icon as={MdArrowBack} transform="rotate(180deg)" />}>
                        Start Development
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card>
                <CardHeader>
                  <HStack>
                    <Icon as={MdOutlineRocketLaunch} color="brand.500" />
                    <Heading size="md">Deployment</Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Text>
                      Get deployment checklists and infrastructure recommendations.
                    </Text>
                    <Link href={`/projects/${projectId}/deploy`} passHref>
                      <Button rightIcon={<Icon as={MdArrowBack} transform="rotate(180deg)" />}>
                        Prepare Deployment
                      </Button>
                    </Link>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Project Plan</Heading>
              </CardHeader>
              <CardBody>
                {project.status === 'Planning' ? (
                  <VStack spacing={4} align="start">
                    <Text>
                      No project plan generated yet. Generate a comprehensive development plan with Claude.
                    </Text>
                    <Link href={`/projects/${projectId}/plan`} passHref>
                      <Button variant="primary">Generate Master Plan</Button>
                    </Link>
                  </VStack>
                ) : (
                  <Text>Project plan view will display here once generated.</Text>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Development Status</Heading>
              </CardHeader>
              <CardBody>
                <Text>Development tracking and assistance will be available here.</Text>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Deployment Preparation</Heading>
              </CardHeader>
              <CardBody>
                <Text>Deployment checklists and infrastructure recommendations will be available here.</Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Divider mb={6} />
      
      <Flex justify="space-between" align="center">
        <Text color="gray.500" fontSize="sm">
          Project ID: {projectId}
        </Text>
        <HStack spacing={4}>
          <Button size="sm" variant="outline">Export as PDF</Button>
          <Button size="sm" variant="outline">Export as Markdown</Button>
        </HStack>
      </Flex>
    </Box>
  );
}