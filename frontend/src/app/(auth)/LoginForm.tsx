import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your Claude App Development Platform account',
};

export default function LoginPage() {
  return (
    <LoginForm />
  );
}