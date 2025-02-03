import Layout from '@/features/common/layout/layout';
import './../globals.css';
import { Inter } from 'next/font/google';
import type React from 'react';
import { AuthGuard } from '@/features/common/auth/AuthGuard';
import { Toaster } from '@/components/ui/toast/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ココいく',
  description: 'イベント検索アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja'>
      <body className={inter.className}>
        <Layout currentPath={'/'}>
          <AuthGuard>{children}</AuthGuard>
        </Layout>
        <Toaster />
      </body>
    </html>
  );
}
