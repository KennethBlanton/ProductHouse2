'use client';

import {
  Avatar,
  Box,
  Flex,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const userBgColor = useColorModeValue('gray.100', 'gray.700');
  const assistantBgColor = useColorModeValue('brand.50', 'brand.900');
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box 
      bg={message.role === 'user' ? userBgColor : assistantBgColor}
      borderRadius="lg"
      p={4}
      mb={4}
      maxW="80%"
      alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
    >
      <Flex mb={2} align="center">
        {message.role === 'assistant' ? (
          <Avatar size="sm" name="Claude" src="/claude-avatar.png" mr={2} />
        ) : (
          <Avatar size="sm" mr={2} />
        )}
        <Text fontWeight="bold">
          {message.role === 'user' ? 'You' : 'Claude'}
        </Text>
        <Text fontSize="xs" color="gray.500" ml={2}>
          {formatTimestamp(message.timestamp)}
        </Text>
      </Flex>
      <Text whiteSpace="pre-line">{message.content}</Text>
    </Box>
  );
}