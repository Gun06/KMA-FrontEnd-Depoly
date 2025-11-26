import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import type { Metadata, Viewport } from 'next';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthInitializer from '@/components/AuthInitializer';

export const metadata: Metadata = {
  title: {
    default: 'KMA - 전국마라톤협회',
    template: '%s | KMA - 전국마라톤협회',
  },
  description:
    '전국마라톤협회 공식 웹사이트입니다. 마라톤 대회 정보, 참가 신청, 결과 확인 등 마라톤 관련 모든 정보를 제공합니다.',
  keywords: ['마라톤', '전국마라톤협회', 'KMA', '달리기', '마라톤대회'],
  authors: [{ name: '전국마라톤협회' }],
  creator: '전국마라톤협회',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'KMA - 전국마라톤협회',
    description: '전국마라톤협회 공식 웹사이트입니다.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-pretendard">
        <QueryProvider>
          <AuthInitializer />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
