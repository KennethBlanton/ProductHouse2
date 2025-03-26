import { Metadata } from 'next';
import ProjectDetail from '@/components/project/ProjectDetail';
import { Suspense } from 'react';
import { Box, Skeleton } from '@chakra-ui/react';

type ProjectPageProps = {
  params: {
    id: string;
  };
};

export const generateMetadata = async ({ params }: ProjectPageProps): Promise<Metadata> => {
  return {
    title: `Project Details | Product House`,
    description: 'View and manage your app development project',
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetail projectId={params.id} />
    </Suspense>
  );
}

function ProjectDetailSkeleton() {
  return (
    <Box>
      <Skeleton height="40px" width="300px" mb={6} />
      <Skeleton height="20px" width="200px" mb={4} />
      <Skeleton height="100px" mb={6} />
      <Skeleton height="300px" mb={6} />
    </Box>
  );
}