import { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Claude App Dev Platform',
    default: 'Dashboard | Claude App Dev Platform',
  },
  description: 'Claude App Development Platform Dashboard',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}