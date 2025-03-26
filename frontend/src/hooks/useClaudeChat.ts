import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import apiClient from '@/lib/api';

// Message type definition
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Conversation type definition
export interface Conversation {
  id: string;
  projectId: string;
  status: 'active' | 'completed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export function useClaudeChat(projectId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  // Initialize or fetch conversation
  const fetchOrCreateConversation = useCallback(async () => {
    try {
      setIsLoadingConversation(true);
      setError(null);
      
      // In a real implementation, this would use the API client
      // const response = await apiClient.getConversations(projectId);
      // const existingConversation = response.find(c => c.status === 'active');
      
      // if (existingConversation) {
      //   setConversation(existingConversation);
      // } else {
      //   const newConversation = await apiClient.startConversation(projectId);
      //   setConversation(newConversation);
      // }
      
      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if there's existing conversation in localStorage (for demo purposes)
      const savedConversation = localStorage.getItem(`conversation_${projectId}`);
      
      if (savedConversation) {
        setConversation(JSON.parse(savedConversation));
      } else {
        // Create a new conversation with initial system message
        const initialConversation: Conversation = {
          id: `conv_${Date.now()}`,
          projectId,
          status: 'active',
          messages: [
            {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: "Hello! I'm Claude, and I'm here to help you refine your app idea. To get started, could you tell me more about the app you're looking to build? Consider including:\n\n- The main purpose or problem your app will solve\n- Your target audience\n- Key features you have in mind\n- Any specific technologies you're interested in using\n- Any existing solutions you're looking to improve upon",
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setConversation(initialConversation);
        localStorage.setItem(`conversation_${projectId}`, JSON.stringify(initialConversation));
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error fetching conversation',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingConversation(false);
    }
  }, [projectId, toast]);

  // Send a message to Claude
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !conversation) {
      return null;
    }
    
    try {
      setIsSendingMessage(true);
      
      // Add user message to conversation
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, userMessage],
        updatedAt: new Date().toISOString(),
      };
      
      setConversation(updatedConversation);
      
      // Save to localStorage for demo
      localStorage.setItem(`conversation_${projectId}`, JSON.stringify(updatedConversation));
      
      // In a real implementation, send message to API
      // const response = await apiClient.sendMessage(conversation.id, content);
      // setConversation(prev => prev ? {
      //   ...prev,
      //   messages: [...prev.messages, response.message],
      //   updatedAt: response.timestamp
      // } : null);
      
      // Mock Claude response after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Prepare Claude's response based on the conversation context
      let claudeResponse = '';
      const lastUserMessage = content.toLowerCase();
      
      if (conversation.messages.length === 1) {
        // First user message - respond to initial app idea
        claudeResponse = generateFirstResponse(lastUserMessage);
      } else if (lastUserMessage.includes('feature') || lastUserMessage.includes('functionality')) {
        // User is discussing features
        claudeResponse = generateFeatureResponse(lastUserMessage);
      } else if (lastUserMessage.includes('user') || lastUserMessage.includes('audience') || lastUserMessage.includes('customer')) {
        // User is discussing target audience
        claudeResponse = generateAudienceResponse(lastUserMessage);
      } else if (lastUserMessage.includes('generate plan') || lastUserMessage.includes('next step') || lastUserMessage.includes('move forward')) {
        // User wants to move to planning phase
        claudeResponse = "Your app idea is taking great shape! I think we've refined it enough to move to the planning phase. Would you like me to generate a master plan with epics, user stories, and a development timeline? This will help structure the development process and give you a clear roadmap.";
      } else {
        // General follow-up
        claudeResponse = generateGeneralResponse(lastUserMessage);
      }
      
      // Add Claude's response
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: claudeResponse,
        timestamp: new Date().toISOString(),
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };
      
      setConversation(finalConversation);
      
      // Save to localStorage for demo
      localStorage.setItem(`conversation_${projectId}`, JSON.stringify(finalConversation));
      
      return finalConversation;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error sending message',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    } finally {
      setIsSendingMessage(false);
    }
  }, [conversation, projectId, toast]);

  // Complete the conversation (e.g., when moving to planning phase)
  const completeConversation = useCallback(async () => {
    if (!conversation) return;
    
    try {
      // In a real implementation, update the conversation status via API
      // await apiClient.updateConversation(conversation.id, { status: 'completed' });
      
      // Update local state
      const completedConversation = {
        ...conversation,
        status: 'completed' as const,
        updatedAt: new Date().toISOString(),
      };
      
      setConversation(completedConversation);
      localStorage.setItem(`conversation_${projectId}`, JSON.stringify(completedConversation));
      
      return completedConversation;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Error completing conversation',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [conversation, projectId, toast]);

  // Fetch the conversation on component mount
  useEffect(() => {
    fetchOrCreateConversation();
  }, [fetchOrCreateConversation]);

  // Helper functions to generate mock Claude responses
  const generateFirstResponse = (message: string) => {
    return `Thanks for sharing details about your app idea! Based on what you've described, I'd like to explore a few aspects further:

1. **Core Value Proposition**: What specific problem does your app solve that existing solutions don't address well?

2. **User Flow**: Can you walk me through how you envision a typical user interacting with your app? What would be the primary actions they'd take?

3. **Unique Features**: Which features do you consider most innovative or essential to your app's success?

4. **Monetization Strategy**: Have you thought about how this app will generate revenue (subscription, freemium, one-time purchase, ads)?

5. **Technical Considerations**: Are there any specific technical challenges you anticipate, or any particular technologies you're committed to using?

Let's refine these aspects to create a more focused app concept.`;
  };
  
  const generateFeatureResponse = (message: string) => {
    return `The features you've outlined make sense for your app concept. Let me help refine them:

- Consider prioritizing these features into "must-have" vs "nice-to-have" categories. This will help focus the initial development phase.
- For your core functionality, have you considered how it would scale with a growing user base?
- I'd recommend starting with a minimal viable product (MVP) that includes only the essential features, then expanding based on user feedback.
- Some of these features might benefit from user testing early in the development process.

Would you like me to help prioritize these features and suggest a phased implementation approach?`;
  };
  
  const generateAudienceResponse = (message: string) => {
    return `Your understanding of the target audience is crucial for app success. Based on what you've shared:

- This demographic will likely have specific expectations around UI/UX design and responsiveness.
- Consider how you'll acquire early users - will you need a marketing strategy specific to this audience?
- Have you considered conducting user interviews or surveys with potential users to validate your assumptions?
- Your target audience might influence technology choices and platform priorities (iOS vs Android, mobile vs web).

Would you like to further define user personas to help guide feature development and design decisions?`;
  };
  
  const generateGeneralResponse = (message: string) => {
    return `Thank you for sharing those details. This helps me understand your vision better.

Some thoughts to consider:

1. How do you see your app evolving over time? Are there future features you're already envisioning?

2. Have you researched competitors in this space? Understanding the competitive landscape can help position your app effectively.

3. What would make users choose your app over alternatives? Identifying your unique selling proposition is crucial.

4. Are there any regulatory or compliance considerations for your app idea (like GDPR, HIPAA, etc.)?

5. Would integrations with other tools or services enhance your app's value?

Let's continue refining your concept to make it as strong as possible before moving to the planning phase.`;
  };

  return {
    conversation,
    isLoadingConversation,
    isSendingMessage,
    error,
    fetchOrCreateConversation,
    sendMessage,
    completeConversation,
  };
}