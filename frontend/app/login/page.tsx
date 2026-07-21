import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { GatewayMark } from '@/components/shared/GatewayMark';
import { LoginForm } from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-navy-900 md:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px] opacity-30">
          <GatewayMark className="h-full w-full" />
        </div>
        <div className="relative max-w-sm px-10 text-white">
          <Logo theme="dark" className="mb-8" />
          <h2 className="font-display text-2xl font-semibold leading-snug">
            Welcome back to your class.
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Log in to message classmates, apply for jobs shared by alumni, and register for upcoming events.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your account details to continue.</p>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-navy-800 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
