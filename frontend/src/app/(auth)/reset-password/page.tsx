import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Create a new password for your Claude App Development Platform account',
};

export default function ResetPasswordPage() {
  return (
    <ResetPasswordForm />
  );
}