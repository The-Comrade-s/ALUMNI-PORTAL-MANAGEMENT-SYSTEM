import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'mark';
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * Renders the official Gateway ICT Polytechnic Saapade logo exactly as
 * supplied — proportions and colors are never altered. `variant="full"`
 * pairs the mark with the institution name for navbars/footers; use the
 * bare image directly wherever just the mark is needed (favicon, loading
 * screen) via /public/images/logo.png.
 */
export function Logo({ variant = 'full', theme = 'light', className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/images/logo.png"
        alt="Gateway ICT Polytechnic Saapade logo"
        width={44}
        height={44}
        priority
        className="h-11 w-11 object-contain"
      />
      {variant === 'full' && (
        <span className={`font-display text-sm font-semibold leading-tight ${theme === 'dark' ? 'text-white' : 'text-navy-800'}`}>
          Gateway ICT Polytechnic
          <span className="block text-xs font-normal text-gold-500">Alumni Portal · Saapade</span>
        </span>
      )}
    </Link>
  );
}
