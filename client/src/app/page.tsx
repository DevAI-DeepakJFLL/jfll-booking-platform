import App from '../App';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LogisticsService',
    name: 'Jet Freight Digital',
    description:
      'Digital air freight marketplace for instant quote comparisons, multi-piece dimension verification, 3-step guided booking, and live shipment milestone tracking.',
    provider: {
      '@type': 'Organization',
      name: 'Jet Freight Logistics Ltd',
      url: 'https://digital.jetfreight.com',
      foundingDate: '1986',
      sameAs: ['https://www.jetfreight.com'],
    },
    serviceType: 'International Air Freight Export',
    areaServed: 'Worldwide',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <App />
    </>
  );
}
