import { Metadata } from 'next';
import ProjectsList from '@/components/project/ProjectsList';

export const metadata: Metadata = {
  title: 'My Projects',
  description: 'Manage your app development projects',
};

export default function ProjectsPage() {
  return (
    <ProjectsList />
  );
}