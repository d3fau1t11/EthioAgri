import './globals.css';
import type { Metadata } from 'next';
import { DemoProvider } from '@/components/demo-provider';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'EthioAgri | Ethiopian Farmers & Fresh Produce',
  description: 'Explore fresh Ethiopian produce and meet local farmers in the EthioAgri demo marketplace.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><DemoProvider><SiteHeader />{children}</DemoProvider></body>
    </html>
  );
}
