import { Metadata } from 'next';
import Link from 'next/link';
import LandingPage from '@/components/common/LandingPage';

export const metadata: Metadata = {
  title: 'Claude-Powered App Development Platform',
  description: 'Transform your app ideas into structured, actionable development plans with Claude.',
};

export default function Home() {
  return (
    <LandingPage />
  );
}