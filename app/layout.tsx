import './globals.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CryptoHub - Real-Time Crypto Trading Dashboard',
  description: 'Monitor Bitcoin, Solana with professional-grade charts, real-time market data, and advanced analytics.',
  keywords: 'crypto, bitcoin, solana dashboard, real-time, charts',
  openGraph: {
    title: 'CryptoHub',
    description: 'Real-time crypto trading dashboard with dual charts',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%23fbbf24'>₿</text></svg>" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}