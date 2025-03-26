'use client';

import { VStack, Flex, Spinner, Text, Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import MessageBubble from '@/components/conversation/MessageBubble';
import { useClaudeChatContext } from '@/components/conversation/ClaudeChatContext';

interface ConversationMessagesProps {
  autoScroll?: boolean;
}

export default function ConversationMessages({ autoScroll = true }: ConversationMessagesProps) {
  const { conversation, isLoadingConversation, error } = useClaudeChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [conversation?.messages, autoScroll]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  if (isLoadingConversation) {
    return (
      <Flex justify="center" align="center" flex="1" p={6}>
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }
  
  if (error) {
    return (
      <Flex justify="center" align="center" flex="1" p={6}>
        <Text color="red.500">Error: {error.message}</Text>
      </Flex>
    );
  }
  
  if (!conversation) {
    return (
      <Flex justify="center" align="center" flex="1" p={6}>
        <Text>No conversation available. Please try refreshing the page.</Text>
      </Flex>
    );
  }
  
  return (
    <Box flex="1" overflowY="auto" p={4}>
      <VStack spacing={0} align="stretch">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
    </Box>
  );