import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DELHI_NCR_STATIONS } from '@/lib/fixtures/delhi-stations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MapPin, ShieldCheck, ArrowLeft, Wind, ExternalLink, HelpCircle } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';
import { LiveStationAQI } from '@/components/LiveStationAQI';

interface LocalityPageProps {
  params: {
    locality: string;
  };
}

const siteUrl = getSiteUrl();

const NOIDA_EDITORIAL: Record<
  string,
  {
    title: string;
    description: string;
    editorial: string;
    localSources: string;
    stationId: string;
  }
> = {
  'noida-sector-62': {
    stationId: 'noida-sec62',
    title: 'Sector 62 Noida AQI Today — Live PM2.5, PM10 & Air Quality Index',
    description:
      'Live Sector 62 Noida AQI today. Continuous CPCB/IMD ambient air quality monitoring station in Sector 62, Gautam Buddh Nagar. Real-time PM2.5 & health advisory.',
    editorial:
      'Sector 62 is a major IT and institutional hub in Noida bordering East Delhi and Ghaziabad. The CAAQMS station located at the IMD campus monitors pollution along the NH-9 corridor and institutional tech parks.',
    localSources:
      'NH-9 (Delhi-Meerut Expressway) vehicular congestion, institutional commuter traffic, and regional dust drift from Ghaziabad industrial areas.',
  },
  'noida-sector-125': {
    stationId: 'noida-sec125',
    title: 'Sector 125 Noida AQI Today — Real-Time Air Quality & PM2.5 Telemetry',
    description:
      'Check live Sector 125 Noida AQI today. Continuous UPPCB CAAQMS monitoring near Amity campus along Noida-Greater Noida Expressway.',
    editorial:
      'Sector 125 is situated along the high-speed Noida-Greater Noida Expressway corridor. The UPPCB continuous monitoring station captures high-volume expressway emissions and Yamuna riverbed dispersion patterns.',
    localSources:
      'Expressway vehicular exhaust, riverbed particulate transport, ongoing construction along educational campuses, and diesel generator operations.',
  },
  'noida-sector-1': {
    stationId: 'noida-sec1',
    title: 'Sector 1 Noida AQI Today — Live Industrial Area Air Quality Index',
    description:
      'Track real-time Sector 1 Noida AQI today. Continuous UPPCB monitoring in Noida Industrial Area adjacent to Delhi border.',
    editorial:
      'Sector 1 lies at the western edge of Noida immediately adjacent to Delhi border across the Yamuna river. The monitoring station provides real-time data on industrial emissions and heavy transit freight traffic.',
    localSources:
      'Industrial fabrication and packaging emissions, freight transport, cross-border commercial traffic from East Delhi, and road dust resuspension.',
  },
};

export async function generateStaticParams() {
  const noidaStations = DELHI_NCR_STATIONS.filter((s) => s.city === 'Noida');
  return noidaStations.map((s) => ({ locality: s.slug }));
}

export async function generateMetadata({ params }: LocalityPageProps): Promise<Metadata> {
  const locKey = params.locality.toLowerCase();
  const editorial = NOIDA_EDITORIAL[locKey];
  const station = DELHI_NCR_STATIONS.find((s) => s.slug === locKey && s.city === 'Noida');

  if (!editorial || !station) return {};

  const url = `${siteUrl}/noida/${locKey}`;

  return {
    title: editorial.title,
    description: editorial.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: editorial.title,
      description: editorial.description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: editorial.title,
      description: editorial.description,
    },
  };
}

export default function LocalityPage({ params }: LocalityPageProps) {
  const locKey = params.locality.toLowerCase();
  const editorial = NOIDA_EDITORIAL[locKey];
  const station = DELHI_NCR_STATIONS.find((s) => s.slug === locKey && s.city === 'Noida');

  if (!editorial || !station) {
    notFound();
  }

  const otherNoida = DELHI_NCR_STATIONS.filter(
    (s) => s.city === 'Noida' && s.slug !== locKey
  );

  const faqs = [
    {
      q: `What is ${station.name} AQI today?`,
      a: `${station.name} AQI today is measured continuously by the ${station.agency} CAAQMS station in Noida. Live PM2.5, PM10, and National AQI (NAQI) levels are updated hourly on AirScope India.`,
    },
    {
      q: `Why is air pollution high in ${station.name}?`,
      a: `Air quality in ${station.name} is predominantly affected by: ${editorial.localSources}`,
    },
    {
      q: `How can residents in Noida protect their health on high AQI days?`,
      a: `When AQI in Noida exceeds 200 (Poor band), use certified N95 respirators outdoors, avoid morning workouts outdoors, and use HEPA air filtration indoors.`,
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Noida AQI', item: `${siteUrl}/noida` },
      { '@type': 'ListItem', position: 3, name: `${station.name} AQI`, item: `${siteUrl}/noida/${locKey}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d12]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-emerald-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/noida" className="hover:text-emerald-400">
            Noida
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{station.name}</span>
        </nav>

        <LiveStationAQI stationId={station.id} title={`${station.name} AQI right now`} />

        {/* Hero Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>{station.agency} — Official Continuous CAAQMS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {station.name} Air Quality Index (AQI) Live
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            {editorial.editorial}
          </p>
        </div>

        {/* Station Meta Card */}
        <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-gray-400">Official Station Identifier</span>
              <h3 className="text-lg font-bold text-white">{station.name} — {station.agency}</h3>
            </div>
            <Link
              href={`/?station=${station.id}#live-aqi`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-all self-start sm:self-auto"
            >
              <span>View Live Dashboard Feed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-300 pt-1">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Address</span>
              <span className="font-sans text-gray-200">{station.address}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Coordinates</span>
              <span>{station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Standard</span>
              <span>CPCB Indian NAQI</span>
            </div>
          </div>
        </div>

        {/* Pollution Dynamics & Local Sources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Local Pollution Sources</span>
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">{editorial.localSources}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <h2 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Health Guidance for {station.name}</span>
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              When ambient particulate levels spike into Poor or Severe bands (NAQI &gt; 200), sensitive
              residents in {station.name} should limit outdoor exertion, wear N95 masks when commuting, and seal
              indoor living spaces with HEPA filtration.
            </p>
          </div>
        </div>

        {/* Visible FAQ Section (Mandatory for valid FAQPage schema) */}
        <section className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Frequently Asked Questions about {station.name} AQI</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#0e141f] border border-white/10 space-y-1.5">
                <h3 className="font-semibold text-sm text-white">{faq.q}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Learn More Links */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white">Learn About Air Quality</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href="/learn/what-is-aqi" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
              What is AQI? →
            </Link>
            <Link href="/learn/pm25-vs-pm10" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
              PM2.5 vs PM10 →
            </Link>
            <Link href="/learn/air-pollution-health-effects" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
              Health Effects →
            </Link>
          </div>
        </div>

        {/* Cross Locality Links */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-sm font-bold text-white">Compare Nearby Localities in Noida</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {otherNoida.map((s) => (
              <Link
                key={s.id}
                href={`/noida/${s.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              >
                {s.name} AQI →
              </Link>
            ))}
            <Link
              href="/noida"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium transition-colors"
            >
              All Noida Stations →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
