import type { Metadata } from 'next';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://airscope-india.onrender.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Delhi AQI Today – Live Air Quality & Pollution Map | AirScope India',
    template: '%s | AirScope India',
  },
  description:
    'Check Delhi AQI today with live readings from 20+ official CPCB/DPCC stations. Hyperlocal PM2.5, PM10, NO2 monitoring for Anand Vihar, Dwarka, Rohini, Noida, Gurugram, Faridabad & Ghaziabad.',
  keywords: [
    'Delhi AQI today',
    'Delhi air quality live',
    'AQI Delhi',
    'Delhi pollution today',
    'Delhi PM2.5',
    'Anand Vihar AQI',
    'Dwarka AQI',
    'Rohini AQI',
    'Noida AQI live',
    'Gurugram AQI',
    'Faridabad AQI',
    'Ghaziabad AQI',
    'Delhi NCR air quality',
    'AirScope India',
    'CPCB air quality index',
    'NAQI India',
  ],
  authors: [{ name: 'AirScope India' }],
  creator: 'AirScope India',
  publisher: 'AirScope India',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'AirScope India',
    title: 'Delhi AQI Today – Live Air Quality & Pollution Map | AirScope India',
    description:
      'Check Delhi AQI today with live readings from 20+ official CPCB/DPCC monitoring stations. Real-time PM2.5, PM10 for entire Delhi NCR.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delhi AQI Today – Live Air Quality & Pollution Map | AirScope India',
    description:
      'Check Delhi AQI today with live readings from 20+ official CPCB/DPCC monitoring stations.',
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
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AirScope India',
    url: siteUrl,
    description:
      'Real-time air quality intelligence platform for Delhi NCR based on official CPCB continuous ambient air quality monitoring station (CAAQMS) data.',
    inLanguage: 'en-IN',
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AirScope India',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      'AirScope India provides hyperlocal real-time air quality data for Delhi NCR powered by official CPCB and DPCC monitoring stations.',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Delhi National Capital Region (NCR), India',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://api.data.gov.in" />
        <link rel="preconnect" href="https://basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://api.openaq.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#090d12] text-slate-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
