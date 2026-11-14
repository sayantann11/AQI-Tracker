import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Calculator, ArrowRight, BookOpen } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'How AQI is Calculated in India: Breakpoints, Formula & Sub-Indices',
  description:
    'Complete guide to the mathematical calculation of India’s National Air Quality Index (NAQI). Explore CPCB breakpoint tables, linear interpolation formula, and sub-index rules.',
  alternates: {
    canonical: `${siteUrl}/learn/how-aqi-is-calculated`,
  },
  openGraph: {
    title: 'How AQI is Calculated in India | AirScope India',
    description:
      'Learn the exact mathematical formulas and CPCB breakpoints used to calculate India’s National Air Quality Index.',
    url: `${siteUrl}/learn/how-aqi-is-calculated`,
    type: 'article',
  },
};

const BREAKPOINTS = [
  { category: 'Good (0–50)', pm25: '0 – 30', pm10: '0 – 50', no2: '0 – 40', o3: '0 – 50', co: '0 – 1.0' },
  { category: 'Satisfactory (51–100)', pm25: '31 – 60', pm10: '51 – 100', no2: '41 – 80', o3: '51 – 100', co: '1.1 – 2.0' },
  { category: 'Moderate (101–200)', pm25: '61 – 90', pm10: '101 – 250', no2: '81 – 180', o3: '101 – 168', co: '2.1 – 10.0' },
  { category: 'Poor (201–300)', pm25: '91 – 120', pm10: '251 – 350', no2: '181 – 280', o3: '169 – 208', co: '10.1 – 17.0' },
  { category: 'Very Poor (301–400)', pm25: '121 – 250', pm10: '351 – 430', no2: '281 – 400', o3: '209 – 748', co: '17.1 – 34.0' },
  { category: 'Severe (401–500)', pm25: '250+', pm10: '430+', no2: '400+', o3: '748+', co: '34.0+' },
];

export default function HowAQIIsCalculatedPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'How AQI is Calculated in India: Breakpoints and Sub-Indices',
    description:
      'The mathematical formula, linear interpolation method, and official CPCB breakpoint tables used to compute India’s NAQI.',
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
    datePublished: '2024-01-25T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/how-aqi-is-calculated`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'How AQI is Calculated', item: `${siteUrl}/learn/how-aqi-is-calculated` },
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
          <span className="text-white font-medium">How AQI is Calculated</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>Methodology & Math</span>
            <span>•</span>
            <span>6 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How AQI is Calculated in India: Breakpoints and Sub-Indices
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            The Central Pollution Control Board (CPCB) calculates the National Air Quality Index using a piecewise
            linear interpolation formula. Here is the step-by-step mathematical methodology behind the numbers
            you see on AirScope India.
          </p>
        </header>

        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. The Linear Interpolation Formula
            </h2>
            <p>
              For each monitored pollutant, the raw measured concentration is transformed into an individual sub-index
              using the standard linear interpolation formula:
            </p>
            <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
              I_p = [ (I_hi - I_lo) / (B_hi - B_lo) ] * (C_p - B_lo) + I_lo
            </div>
            <p className="text-xs text-gray-400">Where:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-300">
              <li><strong>I_p:</strong> Sub-index for pollutant p</li>
              <li><strong>C_p:</strong> Monitored concentration of pollutant p</li>
              <li><strong>B_hi:</strong> Breakpoint concentration greater than or equal to C_p</li>
              <li><strong>B_lo:</strong> Breakpoint concentration less than or equal to C_p</li>
              <li><strong>I_hi:</strong> AQI value corresponding to B_hi</li>
              <li><strong>I_lo:</strong> AQI value corresponding to B_lo</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Official CPCB Breakpoint Concentrations
            </h2>
            <p>
              Concentrations are expressed in &micro;g/m&sup3; (except CO, which is in mg/m&sup3;). Breakpoints are based on
              24-hour average values (except O3 and CO, which use 8-hour averages).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl">
                <thead className="bg-white/5 border-b border-white/10 text-gray-300">
                  <tr>
                    <th className="p-3 font-semibold">AQI Band</th>
                    <th className="p-3 font-semibold">PM2.5 (&micro;g/m&sup3;)</th>
                    <th className="p-3 font-semibold">PM10 (&micro;g/m&sup3;)</th>
                    <th className="p-3 font-semibold">NO2 (&micro;g/m&sup3;)</th>
                    <th className="p-3 font-semibold">CO (mg/m&sup3;)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {BREAKPOINTS.map((b, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-bold text-white">{b.category}</td>
                      <td className="p-3 font-mono text-emerald-400">{b.pm25}</td>
                      <td className="p-3 font-mono text-cyan-400">{b.pm10}</td>
                      <td className="p-3 font-mono">{b.no2}</td>
                      <td className="p-3 font-mono">{b.co}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. Practical Calculation Example
            </h2>
            <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3 text-sm">
              <h3 className="font-bold text-white">Scenario: PM2.5 = 110 &micro;g/m&sup3;</h3>
              <p className="text-gray-300">
                Looking at the CPCB breakpoint table:
              </p>
              <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1">
                <li>110 falls into the Poor category: B_lo = 91, B_hi = 120</li>
                <li>Corresponding AQI scale points: I_lo = 201, I_hi = 300</li>
              </ul>
              <div className="p-3 rounded-lg bg-black/40 font-mono text-xs text-emerald-300">
                I_pm25 = [ (300 - 201) / (120 - 91) ] * (110 - 91) + 201<br />
                I_pm25 = [ 99 / 29 ] * 19 + 201 = 64.86 + 201 = <strong>266 (Poor)</strong>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              4. The Governing Pollutant Rule
            </h2>
            <p>
              Once individual sub-indices are calculated for all available pollutants at a CAAQMS station, CPCB requires:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
              <li>At least <strong>3 pollutants</strong> must be monitored to compute an overall valid AQI.</li>
              <li>At least one of the monitored pollutants <strong>must be PM2.5 or PM10</strong>.</li>
              <li>The overall AQI equals the <strong>maximum sub-index</strong> among all measured pollutants:</li>
            </ul>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-sm text-emerald-300">
              Overall AQI = max(I_pm25, I_pm10, I_no2, I_so2, I_co, I_o3, I_nh3, I_pb)
            </div>
          </section>
        </article>

        {/* Links */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Explore Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/what-is-aqi"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Fundamentals</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                What is AQI? Overview & History →
              </h3>
            </Link>
            <Link
              href="/#comparison"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Data</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Compare Real-Time NCR Station Sub-Indices →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
