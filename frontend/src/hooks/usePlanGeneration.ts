// frontend/src/hooks/usePlanGeneration.ts
import { useState } from 'react';
import apiClient from '@/lib/api';

// Interfaces for structured project plan
export interface UserStory {
  title: string;
  description: string;
  acceptanceCriteria?: string[];
  estimatedHours?: number;
}

export interface Epic {
  name: string;
  description: string;
  userStories: UserStory[];
  estimatedStartWeek?: number;
  estimatedEndWeek?: number;
}

export interface ProjectPlan {
  projectName: string;
  projectDescription: string;
  epics: Epic[];
  totalEstimatedHours?: number;
  estimatedCompletionTimeframe?: string;
}

export function usePlanGeneration(projectId: string) {
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generatePlan = async (params: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the API client to generate the plan
      const generatedPlan = await apiClient.generatePlan(projectId, params);
      
      setPlan(generatedPlan);
      return generatedPlan;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlan = (updatedPlan: ProjectPlan) => {
    setPlan(updatedPlan);
  };

  const exportPlan = async (format: 'pdf' | 'markdown') => {
    try {
      if (format === 'pdf') {
        return await apiClient.exportPlanToPdf(projectId);
      } else {
        return await apiClient.exportPlanToMarkdown(projectId);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  return {
    plan,
    isLoading,
    error,
    generatePlan,
    updatePlan,
    exportPlan,
  };
}