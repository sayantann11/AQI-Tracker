import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'How to Read Live AQI Data for Everyday Decisions | AirScope India',
  description:
    'A practical guide for Delhi NCR residents: how to interpret real-time AQI numbers, monitor hourly pollution spikes, and plan family activities safely.',
  alternates: {
    canonical: `${siteUrl}/learn/how-to-read-aqi`,
  },
  openGraph: {
    title: 'How to Read Live AQI Data for Everyday Decisions | AirScope India',
    description:
      'Turn raw numbers into healthy daily choices: outdoor sports, commutes, school runs, and purifier settings.',
    url: `${siteUrl}/learn/how-to-read-aqi`,
    type: 'article',
  },
};

export default function HowToReadAQIPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How to Read Live AQI Data for Everyday Decisions',
    description:
      'Practical everyday guidance on reading live air quality index data in Delhi NCR.',
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
    datePublished: '2024-02-01T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/how-to-read-aqi`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'How to Read AQI', item: `${siteUrl}/learn/how-to-read-aqi` },
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
          <span className="text-white font-medium">How to Read AQI Data</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>Everyday Guide</span>
            <span>•</span>
            <span>4 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How to Read Live AQI Data for Everyday Decisions
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            When you glance at an AQI dashboard, you are seeing a snapshot of complex atmospheric chemistry.
            Here is how to interpret those numbers to protect your family's health throughout the day.
          </p>
        </header>

        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. Hyperlocal Matters: City Average vs. Neighborhood Station
            </h2>
            <p>
              A single "Delhi AQI" number often misrepresents what you are breathing in your specific locality.
              Because Delhi spans over 1,480 square kilometres with diverse emission pockets, readings can diverge
              wildly between different neighbourhoods at the exact same hour:
            </p>
            <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-2 text-xs sm:text-sm">
              <p>
                For example, while <strong>Anand Vihar</strong> (adjacent to an interstate bus terminal and industrial zone)
                might record an AQI of <strong>420 (Severe)</strong>, stations in greener South Delhi or near the Aravalli
                periphery like <strong>Aya Nagar</strong> might simultaneously report <strong>210 (Poor)</strong>.
              </p>
              <p className="text-emerald-400 font-medium">
                Always check the specific CAAQMS station closest to your home, workplace, or route rather than relying on
                a generalized city-wide figure.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Diurnal Variation: Why AQI Changes Through the Day
            </h2>
            <p>
              Air pollution follows predictable daily cycles dictated by sun angle, atmospheric boundary layer height,
              and traffic peaks:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-300">
              <li>
                <strong>Early Morning (5 AM – 9 AM): Peak Pollution.</strong> Surface cooling creates a shallow atmospheric
                lid ("inversion cap") trapping vehicular emissions and smoke within 50 metres of the ground.
              </li>
              <li>
                <strong>Afternoon (12 PM – 4 PM): Lowest Daily Pollution.</strong> Solar heating warms the ground, breaking
                the inversion and allowing particulate matter to rise and disperse into the upper atmosphere.
              </li>
              <li>
                <strong>Late Evening (8 PM – 12 AM): Secondary Spike.</strong> Commercial truck entry into Delhi combined with
                cooling ground temperatures causes particulates to accumulate rapidly once again.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. Practical Action Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl">
                <thead className="bg-white/5 border-b border-white/10 text-gray-300">
                  <tr>
                    <th className="p-3 font-semibold">AQI Range</th>
                    <th className="p-3 font-semibold">Outdoor Exercise</th>
                    <th className="p-3 font-semibold">Mask Recommendation</th>
                    <th className="p-3 font-semibold">Ventilation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">0 – 100</td>
                    <td className="p-3">Normal outdoor running & sports</td>
                    <td className="p-3">Not required</td>
                    <td className="p-3">Open windows freely</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-400">101 – 200</td>
                    <td className="p-3">Sensitive groups moderate intensity</td>
                    <td className="p-3">Optional for sensitive groups</td>
                    <td className="p-3">Ventilate in afternoon</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-orange-400">201 – 300</td>
                    <td className="p-3">Move workouts indoors</td>
                    <td className="p-3">N95 recommended for all outdoors</td>
                    <td className="p-3">Keep windows closed</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-purple-400">301 – 500</td>
                    <td className="p-3">Cease all vigorous outdoor exertion</td>
                    <td className="p-3">N95 / N99 mandatory outdoors</td>
                    <td className="p-3">Seal doors, run HEPA 24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </article>

        {/* Links */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Continue Exploring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/what-is-aqi"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Fundamentals</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                What is AQI? Complete Overview →
              </h3>
            </Link>
            <Link
              href="/#interactive-map"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">3D Map</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Explore the Delhi NCR 3D Pollution Map →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
