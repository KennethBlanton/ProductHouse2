'use client';

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
  Stack,
  Text,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack, MdOutlineAutoGraph } from 'react-icons/md';
import { ClaudeChatProvider, useClaudeChatContext } from '@/components/conversation/ClaudeChatContext';
import ConversationMessages from '@/components/conversation/ConversationMessages';
import ConversationInput from '@/components/conversation/ConversationInput';

// The inner component that uses the chat context
function RefineIdeaConversationInner({ projectId }: { projectId: string }) {
  const { conversation, completeConversation, isLoadingConversation } = useClaudeChatContext();
  const toast = useToast();
  const router = useRouter();
  
  // Generate plan and move to planning phase
  const handleGeneratePlan = async () => {
    await completeConversation();
    
    toast({
      title: "Moving to planning phase",
      description: "Redirecting to the master plan generation screen",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    // Redirect to plan generation page
    router.push(`/projects/${projectId}/plan`);
  };
  
  return (
    <Flex direction="column" h="calc(100vh - 180px)">
      <HStack mb={6} spacing={4}>
        <Link href={`/projects/${projectId}`} passHref>
          <Button variant="ghost" leftIcon={<MdArrowBack />}>
            Back to Project
          </Button>
        </Link>
        <Heading size="lg">Refine Your App Idea</Heading>
      </HStack>
      
      <Card flex="1" overflow="hidden">
        <CardHeader borderBottomWidth="1px">
          <Flex justify="space-between" align="center">
            <HStack>
              <Icon as={MdOutlineAutoGraph} color="brand.500" boxSize={5} />
              <Heading size="md">Conversation with Claude</Heading>
            </HStack>
            
            <Button 
              variant="primary" 
              size="sm"
              onClick={handleGeneratePlan}
              isDisabled={isLoadingConversation || !conversation || conversation.messages.length < 3}
            >
              Generate Plan
            </Button>
          </Flex>
        </CardHeader>
        
        <CardBody p={0} display="flex" flexDirection="column">
          <ConversationMessages />
          <ConversationInput />
        </CardBody>
      </Card>
      
      <Card mt={6}>
        <CardBody>
          <Stack spacing={4}>
            <Heading size="sm">Tips for refining your app idea</Heading>
            <Divider />
            <Text fontSize="sm">
              <strong>Be specific about problems</strong>: Clearly articulate the problem your app solves and why current solutions are inadequate.
            </Text>
            <Text fontSize="sm">
              <strong>Know your audience</strong>: Define your target users and their needs in detail.
            </Text>
            <Text fontSize="sm">
              <strong>Focus on core functionality</strong>: Prioritize essential features for your MVP before adding nice-to-have elements.
            </Text>
            <Text fontSize="sm">
              <strong>Consider technical feasibility</strong>: Be realistic about what can be built with your resources and timeline.
            </Text>
            <Text fontSize="sm">
              <strong>When ready, generate a plan</strong>: Once your idea is refined, click "Generate Plan" to create a comprehensive development roadmap.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
}

// The main wrapper component that provides the context
interface RefineIdeaConversationProps {
  projectId: string;
}

export default function RefineIdeaConversation({ projectId }: RefineIdeaConversationProps) {
  return (
    <ClaudeChatProvider projectId={projectId}>
      <RefineIdeaConversationInner projectId={projectId} />
    </ClaudeChatProvider>
  );
}