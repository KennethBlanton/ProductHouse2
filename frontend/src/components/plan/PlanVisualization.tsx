'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Progress,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { MdEdit, MdAdd, MdDeleteOutline, MdOutlineDescription, MdTimeline, MdOutlineViewList } from 'react-icons/md';
import PlanEditorModal from './PlanEditorModal';
import PlanTimeline from './PlanTimeline';
import { Plan, Epic, UserStory } from '@/types/plan';

interface PlanVisualizationProps {
  plan: Plan | null;
  onPlanUpdate: (updatedPlan: Plan) => void;
}

export default function PlanVisualization({ plan, onPlanUpdate }: PlanVisualizationProps) {
  const [editingItem, setEditingItem] = useState<{ 
    type: 'epic' | 'story' | 'overview', 
    id?: string, 
    epicId?: string 
  } | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (!plan) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md">No plan generated yet</Heading>
        <Text mt={2}>Please generate a plan first</Text>
      </Box>
    );
  }

  const totalStories = plan.epics.reduce(
    (acc, epic) => acc + epic.userStories.length, 0
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getEstimateLabel = (estimate: number) => {
    if (estimate <= 3) return 'Small';
    if (estimate <= 8) return 'Medium';
    return 'Large';
  };

  const handleEditEpic = (epicId: string) => {
    setEditingItem({ type: 'epic', id: epicId });
    onOpen();
  };

  const handleEditStory = (epicId: string, storyId: string) => {
    setEditingItem({ type: 'story', id: storyId, epicId });
    onOpen();
  };

  const handleEditOverview = () => {
    setEditingItem({ type: 'overview' });
    onOpen();
  };

  const handleAddStory = (epicId: string) => {
    setEditingItem({ type: 'story', epicId });
    onOpen();
  };

  const handleSaveEdit = (
    data: Partial<Epic> | Partial<UserStory> | Partial<Plan>,
    type: 'epic' | 'story' | 'overview',
    epicId?: string,
    storyId?: string
  ) => {
    if (!plan) return;

    let updatedPlan: Plan;

    if (type === 'overview') {
      updatedPlan = { ...plan, ...data as Partial<Plan> };
    } else if (type === 'epic') {
      updatedPlan = {
        ...plan,
        epics: plan.epics.map((epic) => 
          epic.id === epicId ? { ...epic, ...data as Partial<Epic> } : epic
        ),
      };
    } else {
      // It's a story
      updatedPlan = {
        ...plan,
        epics: plan.epics.map((epic) => {
          if (epic.id === epicId) {
            if (storyId) {
              // Edit existing story
              return {
                ...epic,
                userStories: epic.userStories.map((story) =>
                  story.id === storyId ? { ...story, ...data as Partial<UserStory> } : story
                ),
              };
            } else {
              // Add new story
              const newStory: UserStory = {
                id: `story-${Date.now()}`,
                title: (data as Partial<UserStory>).title || 'New User Story',
                description: (data as Partial<UserStory>).description || '',
                acceptanceCriteria: (data as Partial<UserStory>).acceptanceCriteria || [],
                priority: (data as Partial<UserStory>).priority || 'Medium',
                estimate: (data as Partial<UserStory>).estimate || 3,
                status: 'Not Started',
              };
              return {
                ...epic,
                userStories: [...epic.userStories, newStory],
              };
            }
          }
          return epic;
        }),
      };
    }

    onPlanUpdate(updatedPlan);
    onClose();
  };

  const handleDeleteStory = (epicId: string, storyId: string) => {
    if (!plan) return;
    
    const updatedPlan = {
      ...plan,
      epics: plan.epics.map((epic) => {
        if (epic.id === epicId) {
          return {
            ...epic,
            userStories: epic.userStories.filter((story) => story.id !== storyId),
          };
        }
        return epic;
      }),
    };
    
    onPlanUpdate(updatedPlan);
  };

  const handleDeleteEpic = (epicId: string) => {
    if (!plan) return;
    
    const updatedPlan = {
      ...plan,
      epics: plan.epics.filter((epic) => epic.id !== epicId),
    };
    
    onPlanUpdate(updatedPlan);
  };

  return (
    <Box>
      <Tabs colorScheme="brand" variant="enclosed">
        <TabList>
          <Tab>
            <Icon as={MdOutlineViewList} mr={2} />
            Plan Structure
          </Tab>
          <Tab>
            <Icon as={MdTimeline} mr={2} />
            Timeline
          </Tab>
          <Tab>
            <Icon as={MdOutlineDescription} mr={2} />
            Overview
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Heading size="md">{plan.title}</Heading>
                  <HStack spacing={2} mt={1}>
                    <Text color="gray.500">
                      {plan.epics.length} Epics
                    </Text>
                    <Text color="gray.500">•</Text>
                    <Text color="gray.500">
                      {totalStories} User Stories
                    </Text>
                    <Text color="gray.500">•</Text>
                    <Text color="gray.500">
                      {plan.estimatedDuration} timeframe
                    </Text>
                  </HStack>
                </Box>
                <Button 
                  leftIcon={<MdAdd />} 
                  size="sm"
                  onClick={() => {
                    setEditingItem({ type: 'epic' });
                    onOpen();
                  }}
                >
                  Add Epic
                </Button>
              </Flex>

              <Accordion allowMultiple defaultIndex={[0]}>
                {plan.epics.map((epic) => (
                  <AccordionItem 
                    key={epic.id} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    mb={4}
                    borderColor={borderColor}
                  >
                    <AccordionButton py={3}>
                      <Box flex="1" textAlign="left">
                        <Flex align="center" width="100%">
                          <Text fontWeight="bold" fontSize="lg">
                            {epic.title}
                          </Text>
                          <Spacer />
                          <HStack spacing={2} mr={4}>
                            <Badge>
                              {epic.userStories.length} Stories
                            </Badge>
                            <Badge colorScheme={getStatusColor(epic.priority)}>
                              {epic.priority} Priority
                            </Badge>
                          </HStack>
                          <AccordionIcon />
                        </Flex>
                      </Box>
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Text color="gray.600">{epic.description}</Text>
                          <HStack spacing={4} mt={3}>
                            <Tooltip label="Edit Epic">
                              <IconButton
                                aria-label="Edit Epic"
                                icon={<MdEdit />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditEpic(epic.id)}
                              />
                            </Tooltip>
                            <Tooltip label="Delete Epic">
                              <IconButton
                                aria-label="Delete Epic"
                                icon={<MdDeleteOutline />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteEpic(epic.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </Box>

                        <Divider />

                        <Box>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="medium">User Stories</Text>
                            <Button
                              size="xs"
                              leftIcon={<MdAdd />}
                              onClick={() => handleAddStory(epic.id)}
                            >
                              Add Story
                            </Button>
                          </Flex>

                          {epic.userStories.length === 0 ? (
                            <Text color="gray.500" fontSize="sm" textAlign="center" p={4}>
                              No user stories yet. Add one to get started.
                            </Text>
                          ) : (
                            <VStack align="stretch" spacing={3}>
                              {epic.userStories.map((story) => (
                                <Box
                                  key={story.id}
                                  p={3}
                                  borderWidth="1px"
                                  borderRadius="md"
                                  borderColor={borderColor}
                                >
                                  <Flex justify="space-between" align="start">
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="medium">{story.title}</Text>
                                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                        {story.description}
                                      </Text>
                                    </VStack>
                                    <HStack>
                                      <Badge colorScheme={getStatusColor(story.priority)}>
                                        {story.priority}
                                      </Badge>
                                      <Badge>
                                        {getEstimateLabel(story.estimate)} ({story.estimate})
                                      </Badge>
                                    </HStack>
                                  </Flex>

                                  <HStack spacing={2} mt={3}>
                                    <Tooltip label="Edit Story">
                                      <IconButton
                                        aria-label="Edit Story"
                                        icon={<MdEdit />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => handleEditStory(epic.id, story.id)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Delete Story">
                                      <IconButton
                                        aria-label="Delete Story"
                                        icon={<MdDeleteOutline />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => handleDeleteStory(epic.id, story.id)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                </Box>
                              ))}
                            </VStack>
                          )}
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </VStack>
          </TabPanel>

          <TabPanel>
            <PlanTimeline plan={plan} />
          </TabPanel>

          <TabPanel>
            <VStack align="stretch" spacing={6}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Plan Overview</Heading>
                <Button
                  leftIcon={<MdEdit />}
                  size="sm"
                  onClick={handleEditOverview}
                >
                  Edit Overview
                </Button>
              </Flex>

              <Box p={5} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>Project Title</Text>
                    <Text>{plan.title}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={1}>Description</Text>
                    <Text>{plan.description}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={1}>Objectives</Text>
                    <VStack align="stretch" ml={4}>
                      {plan.objectives.map((objective, index) => (
                        <HStack key={index} align="start">
                          <Text>•</Text>
                          <Text>{objective}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={1}>Timeline</Text>
                    <Text>{plan.estimatedDuration}</Text>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={1}>Resources</Text>
                    <VStack align="stretch" ml={4}>
                      {plan.requiredResources.map((resource, index) => (
                        <HStack key={index} align="start">
                          <Text>•</Text>
                          <Text>{resource}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={1}>KPIs</Text>
                    <VStack align="stretch" ml={4}>
                      {plan.keyPerformanceIndicators.map((kpi, index) => (
                        <HStack key={index} align="start">
                          <Text>•</Text>
                          <Text>{kpi}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modal for editing epics/stories */}
      <PlanEditorModal
        isOpen={isOpen}
        onClose={onClose}
        editingItem={editingItem}
        plan={plan}
        onSave={handleSaveEdit}
      />
    </Box>
  );
}