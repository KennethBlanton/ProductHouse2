import { Metadata } from 'next';
import ConfirmRegistrationForm from '@/components/auth/ConfirmRegistrationForm';

export const metadata: Metadata = {
  title: 'Confirm Registration',
  description: 'Confirm your Claude App Development Platform account',
};

export default function ConfirmRegistrationPage() {
  return (
    <ConfirmRegistrationForm />
  );
}