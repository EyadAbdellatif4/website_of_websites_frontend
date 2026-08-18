import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navbar } from '@/src/components/ui/navbar';
import { AnimatedBackground } from '@/src/components/ui/animated-background';
import { AuthProvider } from '@/src/lib/auth/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Website Generation Platform',
  description: 'AI-assisted design analysis and automated website generation platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#080d1a] text-slate-100 font-sans relative selection:bg-indigo-500 selection:text-white"
      >
        <AuthProvider>
          <AnimatedBackground />
          <Navbar />
          <main className="flex-1 relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
