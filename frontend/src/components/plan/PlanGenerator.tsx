'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Icon,
  Spinner,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdArrowBack, MdOutlineCheck, MdSettings, MdAutoGraph, MdOutlineRocketLaunch } from 'react-icons/md';
import Link from 'next/link';
import PlanParametersForm from './PlanParametersForm';
import PlanVisualization from './PlanVisualization';
import PlanExportOptions from './PlanExportOptions';
import { usePlanGeneration } from '@/hooks/usePlanGeneration';
import { Plan, PlanParameters } from '@/types/plan';

interface PlanGeneratorProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
}

export default function PlanGenerator({ projectId, projectName, projectDescription }: PlanGeneratorProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [planParameters, setPlanParameters] = useState<PlanParameters>({
    timeframe: 'medium',
    teamSize: 'small',
    complexity: 'medium',
    includeTesting: true,
    includeDeployment: true,
    priorityFeatures: [],
  });
  const { isGenerating, generatedPlan, generatePlan, error, setGeneratedPlan } = usePlanGeneration(projectId);
  const toast = useToast();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const steps = [
    { title: 'Configure', description: 'Set plan parameters' },
    { title: 'Generate', description: 'Create master plan' },
    { title: 'Review & Export', description: 'Finalize plan' },
  ];

  const handleParametersSubmit = async (params: PlanParameters) => {
    setPlanParameters(params);
    try {
      await generatePlan(params);
      setActiveStep(1);
    } catch (err) {
      toast({
        title: 'Failed to generate plan',
        description: error || 'An error occurred while generating the plan',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePlanApproval = () => {
    setActiveStep(2);
    toast({
      title: 'Plan approved',
      description: 'The master plan has been saved to your project',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleRegeneratePlan = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={4}>
          <Link href={`/projects/${projectId}`} passHref>
            <Button variant="ghost" leftIcon={<MdArrowBack />}>
              Project Details
            </Button>
          </Link>
          <Heading size="lg">Generate Master Plan</Heading>
        </HStack>
      </Flex>

      <Card borderWidth="1px" borderColor={borderColor} mb={6}>
        <CardBody>
          <Stepper index={activeStep} mb={8}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box flexShrink={0}>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <PlanParametersForm 
              projectName={projectName}
              projectDescription={projectDescription}
              initialParameters={planParameters}
              onSubmit={handleParametersSubmit}
              isSubmitting={isGenerating}
            />
          )}

          {activeStep === 1 && (
            <Box>
              {isGenerating ? (
                <Flex direction="column" align="center" justify="center" py={10}>
                  <Spinner size="xl" mb={4} />
                  <Text fontSize="lg">Generating your master plan...</Text>
                  <Text color="gray.500" mt={2}>
                    Claude is creating a comprehensive plan based on your project requirements.
                    This may take a moment.
                  </Text>
                </Flex>
              ) : (
                <Box>
                  <PlanVisualization 
                    plan={generatedPlan}
                    onPlanUpdate={setGeneratedPlan}
                  />
                  <Flex justify="space-between" mt={6}>
                    <Button 
                      onClick={handleRegeneratePlan}
                      leftIcon={<MdSettings />}
                    >
                      Adjust Parameters
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={handlePlanApproval}
                      leftIcon={<MdOutlineCheck />}
                    >
                      Approve Plan
                    </Button>
                  </Flex>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <PlanExportOptions 
              projectId={projectId}
              plan={generatedPlan} 
            />
          )}
        </CardBody>
      </Card>

      {/* Help/Info Card */}
      <Card borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">About Master Plan Generation</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <Text>
              The master plan generation feature uses Claude to create a comprehensive project roadmap
              based on your refined app concept and specified parameters.
            </Text>
            
            <HStack align="start" spacing={4}>
              <Box
                bg="brand.50"
                color="brand.500"
                p={2}
                borderRadius="md"
                fontWeight="bold"
              >
                <Icon as={MdSettings} />
              </Box>
              <Box>
                <Text fontWeight="bold">Configure Parameters</Text>
                <Text color="gray.500">
                  Set your project preferences, team size, and timeline expectations.
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
                <Icon as={MdAutoGraph} />
              </Box>
              <Box>
                <Text fontWeight="bold">Review & Edit</Text>
                <Text color="gray.500">
                  Examine the generated plan structure, make adjustments to epics and user stories.
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
                <Icon as={MdOutlineRocketLaunch} />
              </Box>
              <Box>
                <Text fontWeight="bold">Export & Integrate</Text>
                <Text color="gray.500">
                  Export your plan to various formats or integrate with project management tools.
                </Text>
              </Box>
            </HStack>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}