'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Text,
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import { Plan, Epic, UserStory } from '@/types/plan';

interface EditingItem {
  type: 'epic' | 'story' | 'overview';
  id?: string;
  epicId?: string;
}

interface PlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: EditingItem | null;
  plan: Plan | null;
  onSave: (
    data: Partial<Epic> | Partial<UserStory> | Partial<Plan>,
    type: 'epic' | 'story' | 'overview',
    epicId?: string,
    storyId?: string
  ) => void;
}

export default function PlanEditorModal({
  isOpen,
  onClose,
  editingItem,
  plan,
  onSave,
}: PlanEditorModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState<string>('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState<string>('');
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState<string>('');
  const [kpis, setKpis] = useState<string[]>([]);
  const [newKpi, setNewKpi] = useState<string>('');
  
  const toast = useToast();

  useEffect(() => {
    if (!isOpen || !editingItem || !plan) {
      // Reset form when closing
      setFormData({});
      setCriteria([]);
      setObjectives([]);
      setResources([]);
      setKpis([]);
      return;
    }

    if (editingItem.type === 'epic') {
      if (editingItem.id) {
        // Editing existing epic
        const epic = plan.epics.find((e) => e.id === editingItem.id);
        if (epic) {
          setFormData({
            title: epic.title,
            description: epic.description,
            priority: epic.priority,
          });
        }
      } else {
        // New epic
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
        });
      }
    } else if (editingItem.type === 'story') {
      if (editingItem.id && editingItem.epicId) {
        // Editing existing story
        const epic = plan.epics.find((e) => e.id === editingItem.epicId);
        if (epic) {
          const story = epic.userStories.find((s) => s.id === editingItem.id);
          if (story) {
            setFormData({
              title: story.title,
              description: story.description,
              priority: story.priority,
              estimate: story.estimate,
            });
            setCriteria(story.acceptanceCriteria || []);
          }
        }
      } else {
        // New story
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          estimate: 3,
        });
        setCriteria([]);
      }
    } else if (editingItem.type === 'overview') {
      // Editing plan overview
      setFormData({
        title: plan.title,
        description: plan.description,
        estimatedDuration: plan.estimatedDuration,
      });
      setObjectives(plan.objectives || []);
      setResources(plan.requiredResources || []);
      setKpis(plan.keyPerformanceIndicators || []);
    }
  }, [isOpen, editingItem, plan]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setCriteria((prev) => [...prev, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives((prev) => [...prev, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddResource = () => {
    if (newResource.trim()) {
      setResources((prev) => [...prev, newResource.trim()]);
      setNewResource('');
    }
  };

  const handleRemoveResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddKpi = () => {
    if (newKpi.trim()) {
      setKpis((prev) => [...prev, newKpi.trim()]);
      setNewKpi('');
    }
  };

  const handleRemoveKpi = (index: number) => {
    setKpis((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!editingItem) return;

    try {
      let data: any = { ...formData };

      if (editingItem.type === 'story') {
        data.acceptanceCriteria = criteria;
      } else if (editingItem.type === 'overview') {
        data.objectives = objectives;
        data.requiredResources = resources;
        data.keyPerformanceIndicators = kpis;
      }

      onSave(
        data,
        editingItem.type,
        editingItem.epicId,
        editingItem.id
      );

      toast({
        title: "Changes saved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!editingItem) return null;

  const getModalTitle = () => {
    if (editingItem.type === 'epic') {
      return editingItem.id ? 'Edit Epic' : 'Add Epic';
    } else if (editingItem.type === 'story') {
      return editingItem.id ? 'Edit User Story' : 'Add User Story';
    } else {
      return 'Edit Plan Overview';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getModalTitle()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Epic Form */}
            {editingItem.type === 'epic' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Epic Title</FormLabel>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter epic title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe this epic's purpose and scope"
                    rows={4}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority || 'Medium'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </FormControl>
              </>
            )}

            {/* User Story Form */}
            {editingItem.type === 'story' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Story Title</FormLabel>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter user story title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="As a [user], I want to [action] so that [benefit]"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority || 'Medium'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Estimate (Story Points)</FormLabel>
                  <NumberInput
                    value={formData.estimate || 3}
                    min={1}
                    max={21}
                    onChange={(value) => handleChange('estimate', parseInt(value))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Acceptance Criteria</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Input
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        placeholder="Add a new acceptance criterion"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCriterion();
                          }
                        }}
                      />
                      <IconButton
                        aria-label="Add criterion"
                        icon={<MdAdd />}
                        onClick={handleAddCriterion}
                        isDisabled={!newCriterion.trim()}
                      />
                    </HStack>

                    {criteria.length > 0 ? (
                      <VStack align="stretch" mt={2} spacing={2}>
                        {criteria.map((criterion, index) => (
                          <HStack key={index}>
                            <Text flex="1">• {criterion}</Text>
                            <IconButton
                              aria-label="Remove criterion"
                              icon={<MdDeleteOutline />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveCriterion(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No acceptance criteria added yet. Add criteria to define when this story is complete.
                      </Text>
                    )}
                  </VStack>
                </FormControl>
              </>
            )}

            {/* Plan Overview Form */}
            {editingItem.type === 'overview' && (
              <>
                <FormControl isRequired>
                  <FormLabel>Plan Title</FormLabel>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Master plan title"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe the overall project"
                    rows={3}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Estimated Duration</FormLabel>
                  <Input
                    value={formData.estimatedDuration || ''}
                    onChange={(e) => handleChange('estimatedDuration', e.target.value)}
                    placeholder="e.g., 3-6 months"
                  />
                </FormControl>

                <Divider my={2} />

                <FormControl>
                  <FormLabel>Project Objectives</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Input
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="Add a project objective"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddObjective();
                          }
                        }}
                      />
                      <IconButton
                        aria-label="Add objective"
                        icon={<MdAdd />}
                        onClick={handleAddObjective}
                        isDisabled={!newObjective.trim()}
                      />
                    </HStack>

                    {objectives.length > 0 ? (
                      <VStack align="stretch" mt={2} spacing={2}>
                        {objectives.map((objective, index) => (
                          <HStack key={index}>
                            <Text flex="1">• {objective}</Text>
                            <IconButton
                              aria-label="Remove objective"
                              icon={<MdDeleteOutline />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveObjective(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No objectives added yet. Define the goals of your project.
                      </Text>
                    )}
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Required Resources</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Input
                        value={newResource}
                        onChange={(e) => setNewResource(e.target.value)}
                        placeholder="Add a required resource"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddResource();
                          }
                        }}
                      />
                      <IconButton
                        aria-label="Add resource"
                        icon={<MdAdd />}
                        onClick={handleAddResource}
                        isDisabled={!newResource.trim()}
                      />
                    </HStack>

                    {resources.length > 0 ? (
                      <VStack align="stretch" mt={2} spacing={2}>
                        {resources.map((resource, index) => (
                          <HStack key={index}>
                            <Text flex="1">• {resource}</Text>
                            <IconButton
                              aria-label="Remove resource"
                              icon={<MdDeleteOutline />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveResource(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No resources added yet. Define what you'll need for this project.
                      </Text>
                    )}
                  </VStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Key Performance Indicators (KPIs)</FormLabel>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Input
                        value={newKpi}
                        onChange={(e) => setNewKpi(e.target.value)}
                        placeholder="Add a KPI"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKpi();
                          }
                        }}
                      />
                      <IconButton
                        aria-label="Add KPI"
                        icon={<MdAdd />}
                        onClick={handleAddKpi}
                        isDisabled={!newKpi.trim()}
                      />
                    </HStack>

                    {kpis.length > 0 ? (
                      <VStack align="stretch" mt={2} spacing={2}>
                        {kpis.map((kpi, index) => (
                          <HStack key={index}>
                            <Text flex="1">• {kpi}</Text>
                            <IconButton
                              aria-label="Remove KPI"
                              icon={<MdDeleteOutline />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleRemoveKpi(index)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">
                        No KPIs added yet. Define how you'll measure success.
                      </Text>
                    )}
                  </VStack>
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isDisabled={!formData.title?.trim()}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}