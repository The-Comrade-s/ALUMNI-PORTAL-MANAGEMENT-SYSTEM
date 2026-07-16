import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { GatewayMark } from '@/components/shared/GatewayMark';
import { RegisterForm } from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden bg-navy-900 md:flex">
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-[420px] w-[420px] opacity-30">
          <GatewayMark className="h-full w-full" />
        </div>
        <div className="relative max-w-sm px-10 text-white">
          <Logo theme="dark" className="mb-8" />
          <h2 className="font-display text-2xl font-semibold leading-snug">
            Three minutes to find your class.
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            An administrator or your Class Representative reviews new profiles before they go live in the directory —
            you&apos;ll get an email once you&apos;re approved.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join the Gateway ICT Polytechnic Saapade alumni community.</p>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-navy-800 hover:underline">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
