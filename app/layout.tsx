import type { Metadata } from 'next';
import './globals.css';
import { Geist } from 'next/font/google';
import localFont from 'next/font/local';
import { GoogleAnalytics } from '@next/third-parties/google';
import { cn } from '@/lib/utils';
import NextSessionProvider from '@/components/session-provider';
import FloatingContactButton from '@/components/floating-contact-button';
const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const pretendard = localFont({
    src: '../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
    display: 'swap',
    weight: '45 920',
    variable: '--font-pretendard',
});
export const metadata: Metadata = {
    metadataBase: new URL('https://hypewedding.kr'),
    title: 'HYPE WEDDING',
    description: 'Find your perfect wedding photographer in Korea. HYPE WEDDING connects couples around the world with top studios in Jeju and Seoul.',
};
export default function RootLayout({ children, }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<html lang="en" className={cn('h-full', 'font-sans', geist.variable, pretendard.variable)}>
      <body className="min-h-full flex flex-col">
        <NextSessionProvider>{children}</NextSessionProvider>
        <FloatingContactButton />
      </body>
      <GoogleAnalytics gaId="G-42MJ74SYP4"/>
    </html>);
}
