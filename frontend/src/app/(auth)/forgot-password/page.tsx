import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your Claude App Development Platform password',
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm />
  );
}