import { Metadata } from 'next';
import Dashboard from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Claude App Development Platform Dashboard',
};

export default function DashboardPage() {
  return (
    <Dashboard />
  );
}