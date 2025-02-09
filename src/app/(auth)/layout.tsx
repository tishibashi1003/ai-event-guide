import Layout from '@/features/common/layout/layout';
import './../globals.css';
import type React from 'react';
import { AuthGuard } from '@/features/common/auth/AuthGuard';
import { Toaster } from '@/components/ui/toast/toaster';

export const metadata = {
  title: 'ココいく',
  description: 'おでかけプランニング AI エージェント',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout currentPath={'/'}>
      <AuthGuard>{children}</AuthGuard>
      <Toaster />
    </Layout>
  );
}
