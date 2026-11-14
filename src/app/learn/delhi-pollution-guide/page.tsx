import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Wind, ArrowRight, ShieldCheck } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Why is Delhi So Polluted in Winter? Science, Weather & Geography',
  description:
    'Comprehensive explanation of Delhi NCR winter air crisis. Explore temperature inversions, Indo-Gangetic Plains meteorology, stubble burning, vehicular load, and GRAP regulations.',
  alternates: {
    canonical: `${siteUrl}/learn/delhi-pollution-guide`,
  },
  openGraph: {
    title: 'Why is Delhi So Polluted in Winter? | AirScope India',
    description:
      'The atmospheric physics, seasonal meteorology, and emission sources behind Delhi NCR winter air pollution episodes.',
    url: `${siteUrl}/learn/delhi-pollution-guide`,
    type: 'article',
  },
};

export default function DelhiPollutionGuidePage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Why is Delhi So Polluted in Winter? Geography, Weather & Sources',
    description:
      'Scientific analysis of Delhi NCR winter air pollution, meteorological temperature inversions, and source apportionment.',
    author: {
      '@type': 'Organization',
      name: 'AirScope India',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AirScope India',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
    },
    datePublished: '2024-02-05T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/delhi-pollution-guide`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'Delhi Winter Pollution Guide', item: `${siteUrl}/learn/delhi-pollution-guide` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d12]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-emerald-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-emerald-400">
            Knowledge Centre
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Delhi Winter Pollution</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>Regional Science</span>
            <span>•</span>
            <span>6 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Why is Delhi So Polluted in Winter? Geography, Weather & Sources
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            Every year between October and February, the National Capital Region (Delhi NCR) is shrouded in dense
            toxic smog. While emissions exist year-round, winter creates a lethal combination of geographical traps,
            meteorological inversions, and seasonal source surges.
          </p>
        </header>

        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. The "Valley" Effect of the Indo-Gangetic Plain
            </h2>
            <p>
              Delhi is situated in the landlocked Indo-Gangetic Plain (IGP), bounded by the Himalayas to the north
              and northeast, and the Aravalli range to the southwest. This geological depression acts as a giant bowl
              where airborne particulates accumulate rather than being blown away into open oceans like in coastal
              cities (e.g., Mumbai or Chennai).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Meteorological Inversion & Wind Stagnation
            </h2>
            <p>
              Under normal daytime conditions, the sun warms the Earth's surface, creating warm air that rises and carries
              pollutants up into the atmosphere where high-altitude winds disperse them.
            </p>
            <p>
              During winter in Delhi, however:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-300">
              <li>
                <strong>Surface Radiation Cooling:</strong> On clear, long winter nights, the ground cools rapidly. A cold layer
                of air forms at surface level, with a layer of warmer air resting on top of it.
              </li>
              <li>
                <strong>Atmospheric Lid:</strong> This temperature profile (warm air over cold air) is called a <em>temperature inversion</em>.
                Because cold air is denser than warm air, vertical convection completely halts. The warmer upper layer acts like a sealed pot lid.
              </li>
              <li>
                <strong>Shallow Mixing Height:</strong> In summer, pollutants disperse up to 2,000–3,000 metres high. In winter,
                the mixing height drops to as low as <strong>50 to 100 metres</strong>, compressing the city's emissions into a tiny vertical sliver.
              </li>
              <li>
                <strong>Calm Winds:</strong> Average wind speeds drop below 1 to 2 metres per second (or dead calm), preventing lateral dispersion.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. Source Apportionment: Who Produces the Pollution?
            </h2>
            <p>
              According to extensive source-apportionment studies by IIT Delhi, IIT Kanpur, and SAFAR:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <span className="font-bold text-white text-sm">Vehicular Transport (~30–40%)</span>
                <p className="text-gray-300">
                  Over 13 million registered vehicles in Delhi NCR, diesel freight trucks, two-wheelers, and idling congestion
                  emit ultrafine carbon, NOx, and volatile organic compounds daily.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <span className="font-bold text-white text-sm">Biomass & Crop Burning (~15–35% in Oct–Nov)</span>
                <p className="text-gray-300">
                  Seasonal paddy stubble burning in Punjab, Haryana, and western UP coincides with northwesterly winds,
                  transporting massive plumes of fine smoke directly into NCR.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <span className="font-bold text-white text-sm">Road & Construction Dust (~15–20%)</span>
                <p className="text-gray-300">
                  Unpaved roads, construction sites, and mechanical erosion contribute massive quantities of PM10 and
                  resuspended dust throughout the year.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <span className="font-bold text-white text-sm">Industries & Waste Burning (~10–15%)</span>
                <p className="text-gray-300">
                  Brick kilns, small industrial fabrication plants, and municipal solid waste burning across informal settlements
                  and landfills (e.g. Ghazipur, Bhalswa).
                </p>
              </div>
            </div>
          </section>
        </article>

        {/* Links */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Explore Delhi NCR Air Quality</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/delhi"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Telemetry</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                View All Delhi CAAQMS Monitoring Stations →
              </h3>
            </Link>
            <Link
              href="/learn/air-pollution-health-effects"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Health</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Protecting Yourself During Winter Smog →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
