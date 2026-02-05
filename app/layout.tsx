import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus DeFi Engine - AI-Powered Yield Optimizer',
  description: 'Auto-rebalancing DeFi aggregator for Solana. Built by AI agent for Colosseum Hackathon.',
  keywords: ['Solana', 'DeFi', 'Yield Farming', 'Auto-Rebalancer', 'AI', 'Jupiter', 'Kamino', 'Marinade', 'Raydium'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-nexus-dark text-white`}>
        {children}
      </body>
    </html>
  );
}
