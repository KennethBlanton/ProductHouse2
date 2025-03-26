import { Metadata } from 'next';
import { Suspense } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';
import RefineIdeaConversation from '@/components/conversation/RefineIdeaConversation';

type RefinePageProps = {
  params: {
    id: string;
  };
};

export const generateMetadata = async ({ params }: RefinePageProps): Promise<Metadata> => {
  return {
    title: `Refine Project Idea | Product House`,
    description: 'Refine your app concept through a conversation with Claude',
  };
};

export default function RefinePage({ params }: RefinePageProps) {
  return (
    <Suspense fallback={<RefinePageSkeleton />}>
      <RefineIdeaConversation projectId={params.id} />
    </Suspense>
  );
}

function RefinePageSkeleton() {
  return (
    <Box>
      <Skeleton height="40px" width="300px" mb={6} />
      <Skeleton height="calc(100vh - 200px)" mb={6} />
    </Box>
  );
}