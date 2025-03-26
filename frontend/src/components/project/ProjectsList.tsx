'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  Badge,
  Divider,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MdAdd, MdSearch, MdMoreVert, MdFilterList } from 'react-icons/md';
import { useProjects, Project } from '@/hooks/useProjects';

export default function ProjectsList() {
  const { projects, isLoading, error, fetchProjects, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(projectId);
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
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">My Projects</Heading>
        <Link href="/projects/new" passHref>
          <Button leftIcon={<MdAdd />} variant="primary">
            New Project
          </Button>
        </Link>
      </Flex>
      
      {/* Filters */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        mb={6} 
        gap={4}
        p={4}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="md"
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <InputGroup maxW={{ md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <HStack spacing={2}>
          <Icon as={MdFilterList} color="gray.500" />
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW={{ md: '200px' }}
          >
            <option value="all">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </Select>
        </HStack>
      </Flex>
      
      {/* Error Display */}
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error loading projects</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading State */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="300px">
          <Spinner size="xl" color="brand.500" thickness="4px" />
        </Flex>
      ) : (
        <>
          {/* No Projects State */}
          {projects.length === 0 ? (
            <Card borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stack spacing={3} align="center" textAlign="center" py={10}>
                  <Heading size="md">No projects yet</Heading>
                  <Text color="gray.500">
                    Create your first project to get started with the Claude App Development Platform.
                  </Text>
                  <Link href="/projects/new" passHref>
                    <Button leftIcon={<MdAdd />} variant="primary" mt={4}>
                      Create Project
                    </Button>
                  </Link>
                </Stack>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* No Search Results State */}
              {filteredProjects.length === 0 ? (
                <Card borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <Stack spacing={3} align="center" textAlign="center" py={10}>
                      <Heading size="md">No matching projects</Heading>
                      <Text color="gray.500">
                        Try adjusting your search or filter to find what you're looking for.
                      </Text>
                      <Button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                        Clear Filters
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ) : (
                /* Project Grid */
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredProjects.map((project) => (
                    <Card 
                      key={project.id} 
                      borderWidth="1px" 
                      borderColor={borderColor}
                      transition="all 0.2s"
                      _hover={{ 
                        transform: 'translateY(-4px)', 
                        boxShadow: 'md',
                        borderColor: 'brand.300'
                      }}
                    >
                      <CardBody>
                        <Flex justify="space-between" align="start">
                          <Heading size="md" mb={2} noOfLines={1} title={project.name}>
                            {project.name}
                          </Heading>
                          
                          <Menu>
                            <MenuButton
                              as={Button}
                              variant="ghost"
                              size="sm"
                              icon={<Icon as={MdMoreVert} />}
                              aria-label="Project options"
                            />
                            <MenuList>
                              <Link href={`/projects/${project.id}`} passHref>
                                <MenuItem>View Details</MenuItem>
                              </Link>
                              <Link href={`/projects/${project.id}/edit`} passHref>
                                <MenuItem>Edit Project</MenuItem>
                              </Link>
                              <MenuItem onClick={() => handleDeleteProject(project.id)} color="red.500">
                                Delete Project
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                        
                        <Badge colorScheme={getStatusColor(project.status)} mb={2}>
                          {project.status}
                        </Badge>
                        
                        <Text noOfLines={2} mb={4} color="gray.500" height="40px">
                          {project.description || 'No description provided.'}
                        </Text>
                        
                        <Text fontSize="sm" mb={1}>
                          Progress: {project.progress}%
                        </Text>
                        <Progress
                          value={project.progress}
                          size="sm"
                          colorScheme={project.progress === 100 ? 'green' : 'blue'}
                          mb={4}
                          borderRadius="full"
                        />
                        
                        <Divider mb={3} />
                        
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.500">
                            Updated {project.lastUpdated}
                          </Text>
                          
                          <Link href={`/projects/${project.id}`} passHref>
                            <Button size="sm" variant="outline">
                              Open
                            </Button>
                          </Link>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}