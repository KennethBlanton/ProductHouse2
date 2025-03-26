'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Plan } from '@/types/plan';

interface PlanTimelineProps {
  plan: Plan;
}

export default function PlanTimeline({ plan }: PlanTimelineProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const phaseColors = [
    useColorModeValue('blue.50', 'blue.900'),
    useColorModeValue('purple.50', 'purple.900'),
    useColorModeValue('green.50', 'green.900'),
    useColorModeValue('orange.50', 'orange.900'),
  ];
  const phaseBorderColors = [
    useColorModeValue('blue.200', 'blue.700'),
    useColorModeValue('purple.200', 'purple.700'),
    useColorModeValue('green.200', 'green.700'),
    useColorModeValue('orange.200', 'orange.700'),
  ];
  
  // Calculate phases based on epics
  // This is a simple algorithm dividing epics into phases
  const phases = useMemo(() => {
    if (!plan || !plan.epics.length) return [];
    
    const totalEpics = plan.epics.length;
    const phasesCount = totalEpics <= 3 ? 2 : 4;
    const epicsPerPhase = Math.ceil(totalEpics / phasesCount);
    
    const result = [];
    
    for (let i = 0; i < phasesCount; i++) {
      const startIdx = i * epicsPerPhase;
      const endIdx = Math.min(startIdx + epicsPerPhase, totalEpics);
      
      if (startIdx >= totalEpics) break;
      
      const phaseEpics = plan.epics.slice(startIdx, endIdx);
      
      // Generate phase name based on the epics
      let phaseName = `Phase ${i + 1}`;
      if (i === 0) phaseName = "Foundation";
      else if (i === phasesCount - 1) phaseName = "Finalization";
      else if (i === 1 && phasesCount >= 3) phaseName = "Core Development";
      else if (i === 2 && phasesCount >= 4) phaseName = "Enhancement";
      
      result.push({
        name: phaseName,
        epics: phaseEpics,
        colorIndex: i % phaseColors.length,
      });
    }
    
    return result;
  }, [plan.epics]);
  
  // Estimate phase durations in weeks
  const getEstimatedDuration = (epics: typeof plan.epics) => {
    let totalStoryPoints = 0;
    let storyCount = 0;
    
    epics.forEach(epic => {
      epic.userStories.forEach(story => {
        totalStoryPoints += story.estimate;
        storyCount++;
      });
    });
    
    if (storyCount === 0) return "2-3 weeks";
    
    // Rough estimation: 1 point ≈ 0.5 day
    const daysEstimate = totalStoryPoints * 0.5;
    const weeksEstimate = Math.ceil(daysEstimate / 5); // 5 working days per week
    
    if (weeksEstimate <= 1) return "1 week";
    if (weeksEstimate <= 3) return `${weeksEstimate} weeks`;
    if (weeksEstimate <= 12) return `${Math.ceil(weeksEstimate / 4)} months`;
    return "3+ months";
  };

  return (
    <Box>
      <Heading size="md" mb={6}>Project Timeline</Heading>
      
      <Flex direction="column" gap={6}>
        {phases.map((phase, phaseIndex) => (
          <Box 
            key={phaseIndex}
            position="relative"
            pl={10}
            _before={{
              content: '""',
              position: 'absolute',
              left: '15px',
              top: '24px',
              bottom: '0',
              width: '2px',
              bg: borderColor,
              display: phaseIndex < phases.length - 1 ? 'block' : 'none',
            }}
          >
            <Flex mb={4} align="center">
              <Box
                w="30px"
                h="30px"
                borderRadius="full"
                bg={phaseColors[phase.colorIndex]}
                border="2px solid"
                borderColor={phaseBorderColors[phase.colorIndex]}
                position="absolute"
                left="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="sm"
              >
                {phaseIndex + 1}
              </Box>
              <Box ml={7}>
                <Heading size="sm">{phase.name}</Heading>
                <Text color="gray.500" fontSize="sm">
                  Estimated duration: {getEstimatedDuration(phase.epics)}
                </Text>
              </Box>
            </Flex>
            
            <VStack 
              spacing={4} 
              align="stretch" 
              mb={6}
              ml={7}
            >
              {phase.epics.map((epic) => (
                <Box 
                  key={epic.id} 
                  p={4} 
                  borderWidth="1px" 
                  borderRadius="md"
                  borderColor={borderColor}
                  bg={phaseColors[phase.colorIndex]}
                  borderLeftWidth="3px"
                  borderLeftColor={phaseBorderColors[phase.colorIndex]}
                >
                  <Text fontWeight="bold">{epic.title}</Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {epic.userStories.length} user stories
                  </Text>
                  
                  <Box mt={3}>
                    <Text fontSize="sm" fontWeight="medium">
                      Key stories:
                    </Text>
                    <VStack align="start" spacing={1} mt={1}>
                      {epic.userStories
                        .filter(story => story.priority === 'High')
                        .slice(0, 2)
                        .map(story => (
                          <Text key={story.id} fontSize="sm" pl={2}>
                            • {story.title}
                          </Text>
                        ))}
                      {epic.userStories.filter(story => story.priority === 'High').length === 0 && (
                        <Text fontSize="sm" color="gray.500" pl={2}>
                          No high priority stories
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
        
        {/* End marker */}
        {phases.length > 0 && (
          <Flex align="center" ml={10}>
            <Box
              w="30px"
              h="30px"
              borderRadius="full"
              bg={useColorModeValue('gray.100', 'gray.700')}
              border="2px solid"
              borderColor={borderColor}
              position="absolute"
              left="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              ✓
            </Box>
            <Text fontWeight="medium" ml={7}>
              Project Completion
            </Text>
          </Flex>
        )}
      </Flex>
      
      {phases.length === 0 && (
        <Box textAlign="center" p={8}>
          <Text>No timeline data available</Text>
        </Box>
      )}
    </Box>
  );
}