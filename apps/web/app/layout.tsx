import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Hydrate } from '@/components/hydrate';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'Quzen — Wait from anywhere, not from the line.',
  description: 'Smart virtual queue & waiting intelligence platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Hydrate />
        {children}
      </body>
    </html>
  );
}
