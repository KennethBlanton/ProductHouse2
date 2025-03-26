// src/components/project/PlanGenerationInterface.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Alert,
  AlertIcon,
  Tag,
  TagLabel,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdEdit, MdSave, MdDownload, MdSync } from 'react-icons/md';

// Types for Plan Generation
export interface ProjectPlanParameters {
  targetAudience?: string;
  platformType?: 'Web' | 'Mobile' | 'Desktop' | 'Cross-Platform';
  developmentTimeline?: 'Short-term (1-3 months)' | 'Medium-term (3-6 months)' | 'Long-term (6-12 months)';
  technicalComplexity?: 'Low' | 'Medium' | 'High';
  additionalContext?: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  userStories: UserStory[];
  estimatedEffort: number; // in story points
  priority: 'Low' | 'Medium' | 'High';
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  estimatedEffort: number; // in story points
  priority: 'Low' | 'Medium' | 'High';
}

export interface ProjectPlan {
  projectName: string;
  epics: Epic[];
  estimatedTotalEffort: number;
  estimatedTimeline: string;
  riskAssessment: string[];
}

interface PlanGenerationInterfaceProps {
  projectId: string;
  initialProjectDescription?: string;
}

const PlanGenerationInterface: React.FC<PlanGenerationInterfaceProps> = ({ 
  projectId, 
  initialProjectDescription 
}) => {
  // State Management
  const [parameters, setParameters] = useState<ProjectPlanParameters>({
    platformType: 'Web',
    developmentTimeline: 'Medium-term (3-6 months)',
    technicalComplexity: 'Medium',
  });
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Modals and Toasts
  const { isOpen: isParameterModalOpen, onOpen: onParameterModalOpen, onClose: onParameterModalClose } = useDisclosure();
  const toast = useToast();

  // Generate Project Plan
  const generateProjectPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock API call - replace with actual Claude API integration
      const response = await mockGenerateProjectPlan(parameters, initialProjectDescription);
      setProjectPlan(response);
      toast({
        title: "Project Plan Generated",
        description: "Your project plan has been successfully created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError((err as Error).message);
      toast({
        title: "Plan Generation Failed",
        description: "Unable to generate project plan. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [parameters, initialProjectDescription, toast]);

  // Mock API for Project Plan Generation
  const mockGenerateProjectPlan = async (
    params: ProjectPlanParameters, 
    description?: string
  ): Promise<ProjectPlan> => {
    // Simulating async API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      projectName: "Mobile Banking App",
      epics: [
        {
          id: 'epic-1',
          title: 'User Authentication and Onboarding',
          description: 'Implement secure user registration, login, and profile management',
          userStories: [
            {
              id: 'story-1-1',
              title: 'User Registration',
              description: 'Allow new users to create an account with email or social login',
              acceptanceCriteria: [
                'User can register with email',
                'User can register with Google/Apple',
                'Validate email format',
                'Send verification email'
              ],
              estimatedEffort: 5,
              priority: 'High'
            },
            {
              id: 'story-1-2',
              title: 'User Login',
              description: 'Implement secure login mechanism with multi-factor authentication',
              acceptanceCriteria: [
                'Support email/password login',
                'Implement OAuth login',
                'Add MFA option',
                'Secure password reset flow'
              ],
              estimatedEffort: 5,
              priority: 'High'
            }
          ],
          estimatedEffort: 10,
          priority: 'High'
        },
        // More epics would be generated based on project specifics
      ],
      estimatedTotalEffort: 50,
      estimatedTimeline: '4-5 months',
      riskAssessment: [
        'Integration complexity with banking APIs',
        'Ensuring robust security measures',
        'Compliance with financial regulations'
      ]
    };
  };

  // Export Plan to different formats
  const exportPlan = (format: 'pdf' | 'markdown') => {
    // Implement export logic
    toast({
      title: `Exporting to ${format.toUpperCase()}`,
      description: "Export functionality coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Integrate with Project Management Tool
  const integrateWithPMTool = () => {
    toast({
      title: "PM Tool Integration",
      description: "Integration with Jira, Asana, and other tools coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Render Epics and User Stories
  const renderEpics = () => {
    if (!projectPlan) return null;

    return projectPlan.epics.map((epic) => (
      <AccordionItem key={epic.id}>
        <AccordionButton>
          <Box flex="1" textAlign="left" fontWeight="bold">
            {epic.title}
            <Tag ml={2} size="sm" colorScheme="blue">
              <TagLabel>{epic.estimatedEffort} SP</TagLabel>
            </Tag>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4}>
          <Text mb={2}>{epic.description}</Text>
          {epic.userStories.map((story) => (
            <Card key={story.id} mb={2} variant="outline">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{story.title}</Text>
                    <Text fontSize="sm" color="gray.500">{story.description}</Text>
                  </VStack>
                  <Tag colorScheme={story.priority === 'High' ? 'red' : story.priority === 'Medium' ? 'yellow' : 'green'}>
                    {story.priority}
                  </Tag>
                </HStack>
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Acceptance Criteria:</Text>
                  {story.acceptanceCriteria.map((criteria, index) => (
                    <Text key={index} fontSize="sm" ml={2}>
                      • {criteria}
                    </Text>
                  ))}
                </Box>
              </CardBody>
            </Card>
          ))}
        </AccordionPanel>
      </AccordionItem>
    ));
  };

  // Render Parameters Modal
  const renderParametersModal = () => (
    <Modal isOpen={isParameterModalOpen} onClose={onParameterModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Project Plan Parameters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Target Audience</FormLabel>
              <Input 
                value={parameters.targetAudience || ''}
                onChange={(e) => setParameters(prev => ({
                  ...prev, 
                  targetAudience: e.target.value
                }))}
                placeholder="e.g., Millennials, Small Business Owners"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Platform Type</FormLabel>
              <Select 
                value={parameters.platformType}
                onChange={(e) => setParameters(prev => ({
                  ...prev, 
                  platformType: e.target.value as ProjectPlanParameters['platformType']
                }))}
              >
                <option value="Web">Web</option>
                <option value="Mobile">Mobile</option>
                <option value="Desktop">Desktop</option>
                <option value="Cross-Platform">Cross-Platform</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Development Timeline</FormLabel>
              <Select 
                value={parameters.developmentTimeline}
                onChange={(e) => setParameters(prev => ({
                  ...prev, 
                  developmentTimeline: e.target.value as ProjectPlanParameters['developmentTimeline']
                }))}
              >
                <option value="Short-term (1-3 months)">Short-term (1-3 months)</option>
                <option value="Medium-term (3-6 months)">Medium-term (3-6 months)</option>
                <option value="Long-term (6-12 months)">Long-term (6-12 months)</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Technical Complexity</FormLabel>
              <Select 
                value={parameters.technicalComplexity}
                onChange={(e) => setParameters(prev => ({
                  ...prev, 
                  technicalComplexity: e.target.value as ProjectPlanParameters['technicalComplexity']
                }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Additional Context</FormLabel>
              <Textarea 
                value={parameters.additionalContext || ''}
                onChange={(e) => setParameters(prev => ({
                  ...prev, 
                  additionalContext: e.target.value
                }))}
                placeholder="Provide any additional context that might help in plan generation"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onParameterModalClose}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onParameterModalClose();
              generateProjectPlan();
            }}
          >
            Generate Plan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  // Initial plan generation on component mount
  useEffect(() => {
    if (initialProjectDescription) {
      generateProjectPlan();
    }
  }, [initialProjectDescription, generateProjectPlan]);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Project Plan Generation</Heading>
              <HStack>
                <Tooltip label="Adjust Plan Parameters">
                  <Button 
                    leftIcon={<MdEdit />} 
                    variant="outline" 
                    onClick={onParameterModalOpen}
                  >
                    Edit Parameters
                  </Button>
                </Tooltip>
                <Tooltip label="Regenerate Plan">
                  <Button 
                    leftIcon={<MdSync />} 
                    variant="outline" 
                    isLoading={isLoading}
                    onClick={generateProjectPlan}
                  >
                    Regenerate
                  </Button>
                </Tooltip>
              </HStack>
            </HStack>
          </CardHeader>
          
          {isLoading ? (
            <CardBody>
              <Spinner color="brand.500" />
              <Text ml={3}>Generating project plan...</Text>
            </CardBody>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : projectPlan ? (
            <>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">Project Overview</Heading>
                      <Text>
                        <strong>Estimated Timeline:</strong> {projectPlan.estimatedTimeline}
                      </Text>
                      <Text>
                        <strong>Total Effort:</strong> {projectPlan.estimatedTotalEffort} Story Points
                      </Text>
                    </VStack>
                    <HStack>
                      <Button 
                        leftIcon={<MdDownload />} 
                        variant="outline"
                        onClick={() => exportPlan('pdf')}
                      >
                        Export PDF
                      </Button>
                      <Button 
                        leftIcon={<MdDownload />} 
                        variant="outline"
                        onClick={() => exportPlan('markdown')}
                      >
                        Export Markdown
                      </Button>
                    </HStack>
                  </HStack>

                  <Box>
                    <Heading size="sm" mb={3}>Risk Assessment</Heading>
                    {projectPlan.riskAssessment.map((risk, index) => (
                      <Text key={index} ml={2}>
                        • {risk}
                      </Text>
                    ))}
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>Project Epics</Heading>
                    <Accordion allowMultiple>
                      {renderEpics()}
                    </Accordion>
                  </Box>
                </VStack>
              </CardBody>
              <CardFooter>
                <HStack justify="space-between" width="full">
                  <Button 
                    leftIcon={<MdSync />} 
                    variant="outline"
                    onClick={integrateWithPMTool}
                  >
                    Integrate with PM Tools
                  </Button>
                  <Button 
                    variant="primary"
                    rightIcon={<MdSave />}
                    onClick={() => {
                      // Implement save functionality
                      toast({
                        title: "Plan Saved",
                        description: "Project plan saved successfully.",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    Save Plan
                  </Button>
                </HStack>
              </CardFooter>
            </>
          ) : (
            <CardBody>
              <Alert status="info">
                <AlertIcon />
                <Text>No project plan generated yet. Click 'Edit Parameters' to start.</Text>
              </Alert>
            </CardBody>
          )}
        </Card>

        {/* Render Parameters Modal */}
        {renderParametersModal()}
      </VStack>
    </Box>
  );
};

export default PlanGenerationInterface;

// Utility hook for advanced plan management (optional)
export const usePlanManagement = (projectId: string) => {
  const [plans, setPlans] = useState<ProjectPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<ProjectPlan | null>(null);

  const savePlan = useCallback(async (plan: ProjectPlan) => {
    try {
      // In a real implementation, this would be an API call
      const savedPlan = {
        ...plan,
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setPlans(prevPlans => [...prevPlans, savedPlan]);
      setCurrentPlan(savedPlan);

      return savedPlan;
    } catch (error) {
      console.error('Failed to save plan', error);
      throw error;
    }
  }, []);

  const loadPreviousPlan = useCallback((planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setCurrentPlan(plan);
    }
  }, [plans]);

  const deletePlan = useCallback((planId: string) => {
    setPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
    if (currentPlan?.id === planId) {
      setCurrentPlan(null);
    }
  }, [currentPlan]);

  return {
    plans,
    currentPlan,
    savePlan,
    loadPreviousPlan,
    deletePlan,
  };
};

// Claude Prompt Engineering Template (for backend implementation)
export const generateClaudePrompt = (
  projectDescription: string, 
  parameters: ProjectPlanParameters
): string => {
  return `
You are an expert software product manager and technical architect. Generate a comprehensive project plan for a software development project based on the following details:

Project Description:
${projectDescription}

Project Parameters:
- Platform Type: ${parameters.platformType}
- Development Timeline: ${parameters.developmentTimeline}
- Technical Complexity: ${parameters.technicalComplexity}
- Target Audience: ${parameters.targetAudience || 'Not specified'}
- Additional Context: ${parameters.additionalContext || 'No additional context provided'}

Provide a structured project plan with the following requirements:

1. Break down the project into strategic epics that cover all major functional areas
2. For each epic, generate 2-4 user stories that provide specific, actionable development tasks
3. Assign story points to each epic and user story to indicate complexity and effort
4. Prioritize epics and stories (High/Medium/Low)
5. Include acceptance criteria for each user story
6. Provide a high-level risk assessment for the project
7. Estimate the overall project timeline and total development effort

Output Format:
- Structured JSON that can be parsed by a project management system
- Clear, concise descriptions
- Realistic and pragmatic approach to software development

Focus on creating a plan that is:
- Actionable and specific
- Aligned with modern software development practices
- Flexible enough to accommodate potential changes
- Mindful of the specified technical complexity and platform type
`;
};