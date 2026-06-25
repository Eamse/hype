import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import NextSessionProvider from '@/components/session-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'HYPE WEDDING',
  description:
    'Find your perfect wedding photographer in Korea. HYPE WEDDING connects couples around the world with top studios in Jeju and Seoul.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', 'font-sans', geist.variable)}>
      <body className="min-h-full flex flex-col">
        <NextSessionProvider>{children}</NextSessionProvider>
      </body>
    </html>
  );
}
