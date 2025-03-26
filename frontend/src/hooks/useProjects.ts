import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import apiClient from '@/lib/api';

// Define Project type
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  createdAt: string;
  updatedAt: string;
  lastUpdated?: string; // Formatted string for display
}

// Define create/update project data type
export interface ProjectData {
  name: string;
  description?: string;
  status?: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress?: number;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Format the lastUpdated field for display
  const formatLastUpdated = (date: string): string => {
    const updatedDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - updatedDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would use the API
      // const response = await apiClient.getProjects();
      // const projectsData = response;
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const projectsData = [
        {
          id: '1',
          name: 'Mobile Banking App',
          description: 'A cross-platform mobile banking application with secure transaction capabilities.',
          status: 'In Progress',
          progress: 65,
          createdAt: '2023-01-15T12:00:00Z',
          updatedAt: '2023-03-15T12:00:00Z',
        },
        {
          id: '2',
          name: 'E-commerce Platform',
          description: 'Online shopping platform with product management, cart, and payment processing.',
          status: 'Planning',
          progress: 25,
          createdAt: '2023-02-20T12:00:00Z',
          updatedAt: '2023-03-18T12:00:00Z',
        },
        {
          id: '3',
          name: 'Fitness Tracker',
          description: 'Health and fitness tracking application with workout plans and progress monitoring.',
          status: 'Completed',
          progress: 100,
          createdAt: '2022-11-10T12:00:00Z',
          updatedAt: '2023-02-01T12:00:00Z',
        },
      ] as Project[];
      
      // Add formatted lastUpdated field
      const formattedProjects = projectsData.map(project => ({
        ...project,
        lastUpdated: formatLastUpdated(project.updatedAt),
      }));
      
      setProjects(formattedProjects);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error fetching projects',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Get a single project by ID
  const getProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would use the API
      // const projectData = await apiClient.getProject(projectId);
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const projectData = projects.find(p => p.id === projectId);
      
      if (!projectData) {
        throw new Error('Project not found');
      }
      
      return {
        ...projectData,
        lastUpdated: formatLastUpdated(projectData.updatedAt),
      };
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error fetching project',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projects, toast]);

  // Create a new project
  const createProject = useCallback(async (projectData: ProjectData) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would use the API
      // const createdProject = await apiClient.createProject(projectData);
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const createdProject: Project = {
        id: Math.random().toString(36).substring(2, 9),
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status || 'Planning',
        progress: projectData.progress || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdated: 'Just now',
      };
      
      setProjects(prev => [...prev, createdProject]);
      
      toast({
        title: 'Project created',
        description: `${projectData.name} has been successfully created`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return createdProject;
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error creating project',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update an existing project
  const updateProject = useCallback(async (projectId: string, projectData: Partial<ProjectData>) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would use the API
      // const updatedProject = await apiClient.updateProject(projectId, projectData);
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 800));
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      const updatedProject: Project = {
        ...projects[projectIndex],
        ...projectData,
        updatedAt: new Date().toISOString(),
        lastUpdated: 'Just now',
      };
      
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      setProjects(updatedProjects);
      
      toast({
        title: 'Project updated',
        description: `${updatedProject.name} has been successfully updated`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return updatedProject;
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error updating project',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projects, toast]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real implementation, this would use the API
      // await apiClient.deleteProject(projectId);
      
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 800));
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      const projectName = projects[projectIndex].name;
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      toast({
        title: 'Project deleted',
        description: `${projectName} has been successfully deleted`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error deleting project',
        description: (err as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [projects, toast]);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
  };
}