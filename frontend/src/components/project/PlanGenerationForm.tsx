// frontend/src/components/project/PlanGenerationForm.tsx
'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdArrowBack, MdAutoGraph, MdCode } from 'react-icons/md';
import Link from 'next/link';
import { usePlanGeneration } from '@/hooks/usePlanGeneration';

// Types for plan generation parameters
interface PlanGenerationParams {
  targetAudience: string;
  platformType: 'Web' | 'Mobile' | 'Desktop' | 'Cross-Platform';
  developmentTimeframe: 'Short-term (1-3 months)' | 'Medium-term (3-6 months)' | 'Long-term (6-12 months)';
  keyFeatures: string[];
  additionalContext?: string;
}

interface PlanGenerationFormProps {
  projectId: string;
}

export default function PlanGenerationForm({ projectId }: PlanGenerationFormProps) {
  const { generatePlan, plan, isLoading, error } = usePlanGeneration(projectId);
  const toast = useToast();

  // State for form parameters
  const [params, setParams] = useState<PlanGenerationParams>({
    targetAudience: '',
    platformType: 'Web',
    developmentTimeframe: 'Medium-term (3-6 months)',
    keyFeatures: [''],
    additionalContext: '',
  });

  // Update form parameters
  const handleParamChange = (
    key: keyof PlanGenerationParams, 
    value: string | string[]
  ) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add or remove key feature input
  const updateKeyFeatures = (index: number, value: string) => {
    const newKeyFeatures = [...params.keyFeatures];
    newKeyFeatures[index] = value;
    handleParamChange('keyFeatures', newKeyFeatures);
  };

  // Add new key feature input
  const addKeyFeature = () => {
    handleParamChange('keyFeatures', [...params.keyFeatures, '']);
  };

  // Remove key feature input
  const removeKeyFeature = (index: number) => {
    const newKeyFeatures = params.keyFeatures.filter((_, i) => i !== index);
    handleParamChange('keyFeatures', newKeyFeatures);
  };

  // Submit plan generation
  const handleSubmit = async () => {
    try {
      await generatePlan(params);
      toast({
        title: 'Project Plan Generated',
        description: 'Your comprehensive project plan has been created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Plan Generation Failed',
        description: 'Unable to generate project plan. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box>
      <HStack mb={6} spacing={4} align="center">
        <Link href={`/projects/${projectId}`} passHref>
          <Button variant="ghost" leftIcon={<MdArrowBack />}>
            Back to Project
          </Button>
        </Link>
        <Heading size="lg">Generate Project Plan</Heading>
      </HStack>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
        {/* Plan Generation Parameters */}
        <Box flex={1}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={MdAutoGraph} color="brand.500" />
                <Heading size="md">Plan Generation Parameters</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Target Audience</FormLabel>
                  <Input 
                    placeholder="Describe your target users"
                    value={params.targetAudience}
                    onChange={(e) => handleParamChange('targetAudience', e.target.value)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Platform Type</FormLabel>
                  <Select 
                    value={params.platformType}
                    onChange={(e) => handleParamChange('platformType', e.target.value as PlanGenerationParams['platformType'])}
                  >
                    <option value="Web">Web</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Cross-Platform">Cross-Platform</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Development Timeframe</FormLabel>
                  <Select 
                    value={params.developmentTimeframe}
                    onChange={(e) => handleParamChange('developmentTimeframe', e.target.value as PlanGenerationParams['developmentTimeframe'])}
                  >
                    <option value="Short-term (1-3 months)">Short-term (1-3 months)</option>
                    <option value="Medium-term (3-6 months)">Medium-term (3-6 months)</option>
                    <option value="Long-term (6-12 months)">Long-term (6-12 months)</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Key Features</FormLabel>
                  {params.keyFeatures.map((feature, index) => (
                    <HStack key={index} mb={2}>
                      <Input 
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => updateKeyFeatures(index, e.target.value)}
                      />
                      {params.keyFeatures.length > 1 && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          colorScheme="red"
                          onClick={() => removeKeyFeature(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </HStack>
                  ))}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addKeyFeature}
                    mt={2}
                  >
                    Add Feature
                  </Button>
                </FormControl>

                <FormControl>
                  <FormLabel>Additional Context</FormLabel>
                  <Textarea 
                    placeholder="Provide any additional context or specific requirements"
                    value={params.additionalContext}
                    onChange={(e) => handleParamChange('additionalContext', e.target.value)}
                    rows={4}
                  />
                </FormControl>

                <Button 
                  variant="primary" 
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  loadingText="Generating Plan..."
                >
                  Generate Project Plan
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </Box>

        {/* Generated Plan Preview */}
        <Box flex={1}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={MdCode} color="brand.500" />
                <Heading size="md">Project Plan Preview</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              {plan ? (
                <Accordion allowToggle>
                  {plan.epics.map((epic, epicIndex) => (
                    <AccordionItem key={epicIndex}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left" fontWeight="bold">
                          {epic.name}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text mb={2}>{epic.description}</Text>
                        <Divider mb={2} />
                        <VStack align="stretch" spacing={2}>
                          {epic.userStories.map((story, storyIndex) => (
                            <Box key={storyIndex} bg={useColorModeValue('gray.50', 'gray.700')} p={2} borderRadius="md">
                              <Text fontWeight="semibold">{story.title}</Text>
                              <Text fontSize="sm" color="gray.500">{story.description}</Text>
                            </Box>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Text color="gray.500" textAlign="center">
                  {error 
                    ? 'Error generating plan. Please try again.' 
                    : 'Generated plan will appear here. Adjust parameters and generate.'}
                </Text>
              )}
            </CardBody>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}