// frontend/src/app/projects/[id]/plan/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import PlanGenerationForm from '@/components/project/PlanGenerationForm';

type PlanPageProps = {
  params: {
    id: string;
  };
};

export const generateMetadata = async ({ params }: PlanPageProps): Promise<Metadata> => {
  return {
    title: `Generate Project Plan | Product House`,
    description: 'Generate a comprehensive project plan with Claude',
  };
};

export default function PlanPage({ params }: PlanPageProps) {
  return (
    <Suspense fallback={<PlanPageSkeleton />}>
      <PlanGenerationForm projectId={params.id} />
    </Suspense>
  );
}

function PlanPageSkeleton() {
  return (
    <Box>
      <Skeleton height="40px" width="300px" mb={6} />
      <Skeleton height="20px" width="200px" mb={4} />
      <Skeleton height="calc(100vh - 200px)" mb={6} />
    </Box>
  );
}