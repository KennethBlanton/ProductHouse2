'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormHelperText,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { PlanParameters } from '@/types/plan';

interface PlanParametersFormProps {
  projectName: string;
  projectDescription?: string;
  initialParameters: PlanParameters;
  onSubmit: (parameters: PlanParameters) => void;
  isSubmitting: boolean;
}

export default function PlanParametersForm({
  projectName,
  projectDescription,
  initialParameters,
  onSubmit,
  isSubmitting,
}: PlanParametersFormProps) {
  const [parameters, setParameters] = useState<PlanParameters>(initialParameters);
  const [newFeature, setNewFeature] = useState<string>('');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleParameterChange = (
    field: keyof PlanParameters, 
    value: string | boolean | string[]
  ) => {
    setParameters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleAddFeature = () => {
    if (newFeature.trim() && !parameters.priorityFeatures.includes(newFeature)) {
      handleParameterChange('priorityFeatures', [...parameters.priorityFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };
  
  const handleRemoveFeature = (feature: string) => {
    handleParameterChange(
      'priorityFeatures',
      parameters.priorityFeatures.filter((f) => f !== feature)
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parameters);
  };
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="md" mb={4}>Project Information</Heading>
          <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
            <Text fontWeight="bold">Project Name:</Text>
            <Text mb={2}>{projectName}</Text>
            {projectDescription && (
              <>
                <Text fontWeight="bold" mt={4}>Project Description:</Text>
                <Text>{projectDescription}</Text>
              </>
            )}
          </Box>
        </Box>
        
        <Divider />
        
        <Box>
          <Heading size="md" mb={4}>Plan Parameters</Heading>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            <GridItem>
              <FormControl>
                <FormLabel>Project Timeframe</FormLabel>
                <RadioGroup
                  value={parameters.timeframe}
                  onChange={(value) => handleParameterChange('timeframe', value)}
                >
                  <Stack direction="column">
                    <Radio value="short">
                      <Text fontWeight="medium">Short-term (1-3 months)</Text>
                      <Text fontSize="sm" color="gray.500">Good for MVPs and small projects</Text>
                    </Radio>
                    <Radio value="medium">
                      <Text fontWeight="medium">Medium-term (3-6 months)</Text>
                      <Text fontSize="sm" color="gray.500">Standard timeline for most applications</Text>
                    </Radio>
                    <Radio value="long">
                      <Text fontWeight="medium">Long-term (6+ months)</Text>
                      <Text fontSize="sm" color="gray.500">For complex, enterprise-grade projects</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl>
                <FormLabel>Team Size</FormLabel>
                <RadioGroup
                  value={parameters.teamSize}
                  onChange={(value) => handleParameterChange('teamSize', value)}
                >
                  <Stack direction="column">
                    <Radio value="solo">
                      <Text fontWeight="medium">Solo Developer</Text>
                      <Text fontSize="sm" color="gray.500">Just you working on the project</Text>
                    </Radio>
                    <Radio value="small">
                      <Text fontWeight="medium">Small Team (2-5)</Text>
                      <Text fontSize="sm" color="gray.500">A tight-knit development group</Text>
                    </Radio>
                    <Radio value="medium">
                      <Text fontWeight="medium">Medium Team (5-10)</Text>
                      <Text fontSize="sm" color="gray.500">Multiple developers with specialized roles</Text>
                    </Radio>
                    <Radio value="large">
                      <Text fontWeight="medium">Large Team (10+)</Text>
                      <Text fontSize="sm" color="gray.500">Full development team with multiple specialists</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl>
                <FormLabel>Project Complexity</FormLabel>
                <RadioGroup
                  value={parameters.complexity}
                  onChange={(value) => handleParameterChange('complexity', value)}
                >
                  <Stack direction="column">
                    <Radio value="simple">
                      <Text fontWeight="medium">Simple</Text>
                      <Text fontSize="sm" color="gray.500">Few features, straightforward implementation</Text>
                    </Radio>
                    <Radio value="medium">
                      <Text fontWeight="medium">Medium</Text>
                      <Text fontSize="sm" color="gray.500">Average complexity with some integrations</Text>
                    </Radio>
                    <Radio value="complex">
                      <Text fontWeight="medium">Complex</Text>
                      <Text fontSize="sm" color="gray.500">Many features, integrations, and custom functionality</Text>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </GridItem>
            
            <GridItem>
              <FormControl>
                <FormLabel>Priority Features</FormLabel>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Input
                      placeholder="Add feature (e.g., User Authentication)"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button onClick={handleAddFeature} isDisabled={!newFeature.trim()}>
                      Add
                    </Button>
                  </HStack>
                  <Box width="100%">
                    <Flex wrap="wrap" gap={2} mt={2}>
                      {parameters.priorityFeatures.map((feature) => (
                        <Tag
                          key={feature}
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="brand"
                        >
                          <TagLabel>{feature}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveFeature(feature)} />
                        </Tag>
                      ))}
                    </Flex>
                    {parameters.priorityFeatures.length === 0 && (
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        No priority features added. Plan will include features based on your project description.
                      </Text>
                    )}
                  </Box>
                </VStack>
              </FormControl>
            </GridItem>
          </Grid>
          
          <Box mt={8}>
            <Heading size="sm" mb={4}>Additional Components</Heading>
            <Stack direction={{ base: "column", md: "row" }} spacing={6}>
              <Checkbox
                isChecked={parameters.includeTesting}
                onChange={(e) => handleParameterChange('includeTesting', e.target.checked)}
              >
                <VStack align="start" spacing={0}>
                  <Text>Include Testing Plan</Text>
                  <Text fontSize="sm" color="gray.500">
                    Generate test plans and QA strategies
                  </Text>
                </VStack>
              </Checkbox>
              
              <Checkbox
                isChecked={parameters.includeDeployment}
                onChange={(e) => handleParameterChange('includeDeployment', e.target.checked)}
              >
                <VStack align="start" spacing={0}>
                  <Text>Include Deployment Plan</Text>
                  <Text fontSize="sm" color="gray.500">
                    Add deployment and release management steps
                  </Text>
                </VStack>
              </Checkbox>
            </Stack>
          </Box>
        </Box>
        
        <Flex justify="flex-end" mt={4}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Generating..."
          >
            Generate Master Plan
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}