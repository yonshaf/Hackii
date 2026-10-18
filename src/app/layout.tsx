import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { UtilityBar } from '@/components/layout/UtilityBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EventScout — Discover Your Next Opportunity',
  description:
    'AI-powered technical event discovery platform aggregating hackathons, workshops, developer conferences, and coding competitions with live web extraction.',
  keywords: [
    'hackathons 2026',
    'developer conferences',
    'coding competitions',
    'technical workshops',
    'tech meetups',
    'EventScout',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <UtilityBar />
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
