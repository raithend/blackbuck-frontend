import { SignupForm } from '@/components/auth/signup-form'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-950 p-8 rounded-lg shadow-md">
        <SignupForm />
      </div>
    </div>
  )
} 