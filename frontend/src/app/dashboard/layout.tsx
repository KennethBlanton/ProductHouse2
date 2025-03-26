import { Metadata } from 'next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Product House',
    default: 'Dashboard | Product House',
  },
  description: 'Claude App Development Platform Dashboard',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}