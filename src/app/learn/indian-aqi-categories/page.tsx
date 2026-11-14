import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Indian AQI Categories Explained — Good to Severe Bands & Health Risks',
  description:
    'Detailed breakdown of the 6 official CPCB National Air Quality Index (NAQI) categories in India: Good, Satisfactory, Moderate, Poor, Very Poor, and Severe.',
  alternates: {
    canonical: `${siteUrl}/learn/indian-aqi-categories`,
  },
  openGraph: {
    title: 'The 6 Indian AQI Categories Explained | AirScope India',
    description:
      'Learn what each color and number band means under official Indian CPCB NAQI guidelines.',
    url: `${siteUrl}/learn/indian-aqi-categories`,
    type: 'article',
  },
};

const CATEGORIES = [
  {
    range: '0 – 50',
    name: 'Good',
    colorBg: 'bg-emerald-500/20',
    colorBorder: 'border-emerald-500/40',
    colorText: 'text-emerald-400',
    hex: '#10b981',
    description: 'Minimal impact. Air quality is considered satisfactory, and air pollution poses little or no risk.',
    precautions: 'Enjoy outdoor activities. Open windows for fresh air ventilation.',
  },
  {
    range: '51 – 100',
    name: 'Satisfactory',
    colorBg: 'bg-lime-500/20',
    colorBorder: 'border-lime-500/40',
    colorText: 'text-lime-400',
    hex: '#84cc16',
    description: 'Minor breathing discomfort to sensitive people including asthma patients and children.',
    precautions: 'Healthy individuals can perform normal activities; unusually sensitive people should monitor symptoms.',
  },
  {
    range: '101 – 200',
    name: 'Moderate',
    colorBg: 'bg-amber-500/20',
    colorBorder: 'border-amber-500/40',
    colorText: 'text-amber-400',
    hex: '#f59e0b',
    description: 'Breathing discomfort to people with lungs, asthma, and heart diseases, and children/elderly.',
    precautions: 'Sensitive groups should reduce prolonged outdoor exertion. Consider air purifiers indoors.',
  },
  {
    range: '201 – 300',
    name: 'Poor',
    colorBg: 'bg-orange-500/20',
    colorBorder: 'border-orange-500/40',
    colorText: 'text-orange-400',
    hex: '#f97316',
    description: 'Breathing discomfort to most people on prolonged exposure. Worsens existing heart/lung conditions.',
    precautions: 'Wear N95 masks when stepping out. Shift intense cardio workouts indoors. Keep windows closed.',
  },
  {
    range: '301 – 400',
    name: 'Very Poor',
    colorBg: 'bg-red-500/20',
    colorBorder: 'border-red-500/40',
    colorText: 'text-red-400',
    hex: '#ef4444',
    description: 'Respiratory illness to the people on prolonged exposure. Pronounced symptoms in vulnerable groups.',
    precautions: 'Avoid morning outdoor exercise. Run HEPA air purifiers 24/7. High-risk individuals should stay indoors.',
  },
  {
    range: '401 – 500',
    name: 'Severe',
    colorBg: 'bg-purple-500/20',
    colorBorder: 'border-purple-500/40',
    colorText: 'text-purple-400',
    hex: '#a855f7',
    description: 'Affects healthy people and seriously impacts those with existing diseases. Public health emergency level.',
    precautions: 'Strict emergency protocols: N95/N99 respirators mandatory, cease all outdoor sports, schools may close.',
  },
];

export default function IndianAQICategoriesPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'The 6 Indian AQI Categories Explained (Good to Severe)',
    description:
      'Official breakdown of the Central Pollution Control Board (CPCB) six color-coded AQI categories and corresponding health impacts.',
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
    datePublished: '2024-01-22T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/indian-aqi-categories`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'AQI Categories', item: `${siteUrl}/learn/indian-aqi-categories` },
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
          <span className="text-white font-medium">Indian AQI Categories</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>Official Standards</span>
            <span>•</span>
            <span>4 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The 6 Indian NAQI Categories Explained (Good to Severe)
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            The Central Pollution Control Board (CPCB) divides India’s National Air Quality Index (NAQI) into six
            distinct color-coded categories. Each band corresponds to a quantified concentration threshold and carries
            specific medical and public health guidance.
          </p>
        </header>

        <article className="space-y-6">
          <div className="space-y-4">
            {CATEGORIES.map((cat, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl bg-[#0e141f] border ${cat.colorBorder} space-y-3 transition-all`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: cat.hex }}
                    />
                    <h2 className="text-xl font-bold text-white">
                      {cat.name}
                    </h2>
                  </div>
                  <span className={`text-sm font-mono font-bold px-3 py-1 rounded-full ${cat.colorBg} ${cat.colorText}`}>
                    AQI {cat.range}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-400 font-semibold">Official CPCB Impact: </span>
                    <span className="text-gray-200">{cat.description}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold">Recommended Actions: </span>
                    <span className="text-gray-300">{cat.precautions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="space-y-3 pt-4 border-t border-white/10 text-sm sm:text-base text-gray-300">
            <h2 className="text-xl font-bold text-white">What Happens Beyond 500? ("Severe+")</h2>
            <p>
              The mathematical Indian NAQI formula officially caps out at 500. However, during acute inversion episodes in
              Delhi NCR, raw pollutant concentrations (especially PM2.5) can dramatically exceed the 500-index threshold.
            </p>
            <p>
              Under the Supreme Court-mandated <strong>Graded Response Action Plan (GRAP)</strong>, when AQI stays in the
              Severe category (401–450) or Severe+ (above 450), the Commission for Air Quality Management (CAQM) enforces Stage III
              and Stage IV emergency measures:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-300">
              <li>Complete ban on non-essential construction and demolition activities.</li>
              <li>Prohibition of BS-III petrol and BS-IV diesel passenger vehicles on Delhi roads.</li>
              <li>Entry restrictions on non-electric, non-CNG commercial trucks into Delhi.</li>
              <li>Closure of primary and middle schools with transition to online classes.</li>
              <li>50% work-from-home advisory for public and private offices.</li>
            </ul>
          </section>
        </article>

        {/* Links */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Related Technical Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/how-aqi-is-calculated"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Calculation Math</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                How AQI is Calculated: Breakpoints & Math →
              </h3>
            </Link>
            <Link
              href="/delhi"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Live Stations</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Check Live Delhi NCR Station Categories →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
