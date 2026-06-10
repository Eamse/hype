import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';
import NextSessionProvider from '@/components/session-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'HYPE WEDDING',
  description:
    '유행을 따르는 결혼식 대신, 당신의 취향을 담은 웨딩을 완성하세요. 플래너 없이도 완벽한 준비, 호닌이 제안하는 스마트한 결혼준비의 시작.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn('h-full', 'font-sans', geist.variable)}>
      <body className="min-h-full flex flex-col">
        <NextSessionProvider>{children}</NextSessionProvider>
      </body>
    </html>
  );
}
