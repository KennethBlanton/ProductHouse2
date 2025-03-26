'use client';

import { 
  Box, 
  HStack, 
  Textarea, 
  IconButton, 
  useColorModeValue 
} from '@chakra-ui/react';
import { useState } from 'react';
import { MdSend } from 'react-icons/md';
import { useClaudeChatContext } from '@/components/conversation/ClaudeChatContext';

interface ConversationInputProps {
  onMessageSent?: () => void;
}

export default function ConversationInput({ onMessageSent }: ConversationInputProps) {
  const [newMessage, setNewMessage] = useState('');
  const { sendMessage, isSendingMessage } = useClaudeChatContext();
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      onMessageSent?.();
    }
  };
  
  return (
    <Box p={4} borderTopWidth="1px" bg={useColorModeValue('white', 'gray.800')}>
      <form onSubmit={handleSendMessage}>
        <HStack>
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            resize="none"
            rows={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<MdSend />}
            colorScheme="brand"
            type="submit"
            isLoading={isSendingMessage}
            isDisabled={!newMessage.trim()}
          />
        </HStack>
      </form>
    </Box>
  );
}