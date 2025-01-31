import Layout from '@/features/common/layout/layout';
import './../globals.css';
import { Inter } from 'next/font/google';
import type React from 'react';

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
        <Layout currentPath={'/'}>{children}</Layout>
      </body>
    </html>
  );
}
