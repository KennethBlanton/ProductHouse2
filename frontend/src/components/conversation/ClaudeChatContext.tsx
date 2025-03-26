'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useClaudeChat, Message, Conversation } from '@/hooks/useClaudeChat';

// Define context type
interface ClaudeChatContextType {
  conversation: Conversation | null;
  isLoadingConversation: boolean;
  isSendingMessage: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<Conversation | null>;
  completeConversation: () => Promise<Conversation | null>;
}

// Create context
const ClaudeChatContext = createContext<ClaudeChatContextType | undefined>(undefined);

// Provider component
interface ClaudeChatProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ClaudeChatProvider({ children, projectId }: ClaudeChatProviderProps) {
  const claudeChat = useClaudeChat(projectId);
  
  return (
    <ClaudeChatContext.Provider value={claudeChat}>
      {children}
    </ClaudeChatContext.Provider>
  );
}

// Custom hook to use the context
export function useClaudeChatContext() {
  const context = useContext(ClaudeChatContext);
  
  if (context === undefined) {
    throw new Error('useClaudeChatContext must be used within a ClaudeChatProvider');
  }
  
  return context;
}

// Export types
export type { Message, Conversation };