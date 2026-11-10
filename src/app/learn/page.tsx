import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { BookOpen, ShieldCheck, Activity, Wind, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://airscope-india.onrender.com';

export const metadata: Metadata = {
  title: 'Air Quality Knowledge Centre — Learn AQI, PM2.5, Health Impact',
  description:
    'Comprehensive educational guides on air quality in India. Understand CPCB NAQI categories, PM2.5 vs PM10, AQI calculation formulas, and health protection strategies.',
  alternates: {
    canonical: `${siteUrl}/learn`,
  },
  openGraph: {
    title: 'Air Quality Knowledge Centre | AirScope India',
    description:
      'Learn how air quality is monitored, calculated, and classified under India’s National Air Quality Index (NAQI).',
    url: `${siteUrl}/learn`,
    type: 'website',
  },
};

const ARTICLES = [
  {
    slug: 'what-is-aqi',
    title: 'What is AQI? Understanding India’s Air Quality Index',
    description:
      'An introduction to the Air Quality Index (AQI), its history in India, the eight criteria pollutants, and how one single number communicates complex air data.',
    icon: Wind,
    readTime: '4 min read',
    category: 'Fundamentals',
  },
  {
    slug: 'pm25-vs-pm10',
    title: 'PM2.5 vs PM10: Size, Sources, and Why Fine Particles Matter',
    description:
      'A deep dive into particulate matter: microscopic size comparisons, biological penetration into the lungs and bloodstream, and primary emission sources in Delhi NCR.',
    icon: Activity,
    readTime: '5 min read',
    category: 'Particulate Science',
  },
  {
    slug: 'indian-aqi-categories',
    title: 'The 6 Indian NAQI Categories Explained (Good to Severe)',
    description:
      'Detailed breakdown of the Central Pollution Control Board (CPCB) color-coded bands: Good, Satisfactory, Moderate, Poor, Very Poor, and Severe.',
    icon: ShieldCheck,
    readTime: '4 min read',
    category: 'Standards',
  },
  {
    slug: 'how-aqi-is-calculated',
    title: 'How AQI is Calculated in India: Breakpoints and Sub-Indices',
    description:
      'The mathematics behind Indian NAQI: linear interpolation formulas, 24-hour vs 8-hour averaging, sub-index calculation, and the maximum-operator rule.',
    icon: BookOpen,
    readTime: '6 min read',
    category: 'Methodology',
  },
  {
    slug: 'air-pollution-health-effects',
    title: 'Health Effects of Air Pollution & How to Protect Yourself',
    description:
      'Evidence-based health guidance for high AQI days: respiratory vulnerabilities, N95 vs surgical masks, HEPA air purifiers, and exercise scheduling.',
    icon: AlertTriangle,
    readTime: '5 min read',
    category: 'Health Advisory',
  },
  {
    slug: 'how-to-read-aqi',
    title: 'How to Read Live AQI Data for Everyday Decisions',
    description:
      'A practical guide for Delhi NCR residents: planning morning walks, timing outdoor workouts, school commutes, and interpreting hourly spikes.',
    icon: HelpCircle,
    readTime: '4 min read',
    category: 'Practical Guide',
  },
  {
    slug: 'delhi-pollution-guide',
    title: 'Why is Delhi So Polluted in Winter? Geography, Weather & Sources',
    description:
      'The science behind Delhi’s annual winter air crisis: atmospheric temperature inversions, wind stagnation, stubble burning, and urban emission traps.',
    icon: Wind,
    readTime: '6 min read',
    category: 'Regional Analysis',
  },
];

export default function LearnIndexPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d12]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-emerald-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Knowledge Centre</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span>AirScope Knowledge Centre</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Air Quality Intelligence, Explained Simply
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            Understanding air quality data shouldn’t require an environmental science degree. Explore
            our clear, science-backed guides based on official Central Pollution Control Board (CPCB) and
            World Health Organization (WHO) standards.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((article) => {
            const Icon = article.icon;
            return (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="group p-6 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {article.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Data CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0e141f] to-cyan-500/10 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl font-bold text-white">Ready to check live air quality?</h2>
            <p className="text-xs text-gray-300">
              AirScope tracks continuous readings from 20+ official CAAQMS monitoring stations across Delhi, Noida,
              Gurugram, Faridabad, and Ghaziabad.
            </p>
          </div>
          <Link
            href="/#live-aqi"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
          >
            Explore Live Dashboard →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
