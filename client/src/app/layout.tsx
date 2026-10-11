import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jet Freight Digital | Air Freight Booking & Instant Live Quotes',
  description:
    'Instant live air cargo rates across 150+ countries, spot and negotiated tariffs, 3-step guided booking, and real-time tracking from Jet Freight Logistics Ltd (JFLL). IATA Accredited Agent.',
  keywords: [
    'air freight booking',
    'instant cargo quote',
    'air cargo India',
    'Jet Freight Logistics',
    'freight forwarder India',
    'BOM to DXB air cargo',
    'IATA cargo agent',
    'logistics marketplace',
  ],
  authors: [{ name: 'Jet Freight Logistics Ltd' }],
  creator: 'Jet Freight Logistics Ltd',
  publisher: 'Jet Freight Logistics Ltd',
  metadataBase: new URL('https://digital.jetfreight.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Jet Freight Digital | Air Freight Booking & Instant Live Quotes',
    description:
      'Instant spot rates, direct airline allocations, and transparent milestones for Indian air freight. Quote in seconds, book with certainty.',
    url: 'https://digital.jetfreight.com',
    siteName: 'Jet Freight Digital',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jet Freight Digital | Air Freight Booking & Instant Live Quotes',
    description:
      'Instant spot rates, direct airline allocations, and transparent milestones for Indian air freight.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#16243a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#f9f8f6] text-[#16243a]">
        {children}
      </body>
    </html>
  );
}
