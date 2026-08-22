import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import { cn } from '@/lib/utils';
import NextSessionProvider from '@/components/session-provider';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

// CDN(@import)으로 매 페이지마다 굵기별 900KB짜리 폰트 파일들을 따로 받던 걸
// self-host 가변 폰트 파일 하나로 교체 — 요청 수/용량을 크게 줄임
const pretendard = localFont({
  src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

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
    <html
      lang="en"
      className={cn('h-full', 'font-sans', geist.variable, pretendard.variable)}
    >
      <body className="min-h-full flex flex-col">
        <NextSessionProvider>{children}</NextSessionProvider>
      </body>
    </html>
  );
}
