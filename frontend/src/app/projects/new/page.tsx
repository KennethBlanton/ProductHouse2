import { Metadata } from 'next';
import NewProjectForm from '@/components/project/NewProjectForm';

export const metadata: Metadata = {
  title: 'Create New Project',
  description: 'Create a new app development project with Claude',
};

export default function NewProjectPage() {
  return (
    <NewProjectForm />
  );
}