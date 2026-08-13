import { AuthRegisterForm } from '@/src/components/auth/auth-register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <AuthRegisterForm />
    </div>
  );
}
