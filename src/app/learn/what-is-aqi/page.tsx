import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Wind, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://airscope-india.onrender.com';

export const metadata: Metadata = {
  title: 'What is AQI? Understanding India’s Air Quality Index (NAQI)',
  description:
    'Complete guide to India’s National Air Quality Index (NAQI). Learn how 8 key pollutants are converted into a single easy-to-understand number by the Central Pollution Control Board.',
  alternates: {
    canonical: `${siteUrl}/learn/what-is-aqi`,
  },
  openGraph: {
    title: 'What is AQI? Understanding India’s Air Quality Index | AirScope India',
    description:
      'Discover how the Air Quality Index works in India, who created it, and what pollutants determine your air reading.',
    url: `${siteUrl}/learn/what-is-aqi`,
    type: 'article',
  },
};

export default function WhatIsAQIPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'What is AQI? Understanding India’s Air Quality Index',
    description:
      'A comprehensive guide to India’s National Air Quality Index (NAQI), its criteria pollutants, and how CPCB calculates and reports air quality.',
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
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: '2024-01-15T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/what-is-aqi`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'What is AQI?', item: `${siteUrl}/learn/what-is-aqi` },
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
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-emerald-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-emerald-400">
            Knowledge Centre
          </Link>
          <span>/</span>
          <span className="text-white font-medium">What is AQI?</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>Air Quality Fundamentals</span>
            <span>•</span>
            <span>4 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            What is AQI? Understanding India’s Air Quality Index
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            The Air Quality Index (AQI) is a standardised numerical scale used worldwide by governments and
            health authorities to communicate the cleanliness or toxicity of ambient air in simple, actionable terms.
          </p>
        </header>

        {/* Article Content */}
        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Why Does India Have Its Own AQI Scale?
            </h2>
            <p>
              In October 2014, the Government of India launched the National Air Quality Index (NAQI) under the
              Swachh Bharat Abhiyan initiative. Before this, raw scientific numbers like micrograms per cubic metre
              (&micro;g/m&sup3;) were reported, which meant very little to ordinary citizens deciding whether to let
              their children play outdoors or whether to wear a mask.
            </p>
            <p>
              Developed by an expert group chaired by IIT Kanpur along with the Central Pollution Control Board (CPCB),
              the Indian NAQI uses the philosophy of <em>"One Number – One Colour – One Description"</em> to help the general
              public judge local air quality at a glance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The 8 Criteria Pollutants Monitored
            </h2>
            <p>
              Under Indian NAQI standards, continuous air quality monitoring stations (CAAQMS) measure up to eight
              individual pollutants:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'PM2.5 (Fine Particulate)', desc: 'Particles under 2.5 micrometres from combustion and vehicles' },
                { name: 'PM10 (Coarse Particulate)', desc: 'Dust, construction debris, road dust under 10 micrometres' },
                { name: 'NO2 (Nitrogen Dioxide)', desc: 'Combustion byproduct from vehicles and thermal power stations' },
                { name: 'SO2 (Sulphur Dioxide)', desc: 'Emissions from coal burning and heavy industrial refining' },
                { name: 'CO (Carbon Monoxide)', desc: 'Incomplete fuel combustion from engines and generators' },
                { name: 'O3 (Ground-Level Ozone)', desc: 'Formed when NOx and VOCs react in sunlight' },
                { name: 'NH3 (Ammonia)', desc: 'Agricultural fertilisers, animal waste, and waste treatment' },
                { name: 'Pb (Lead)', desc: 'Industrial smelting, battery manufacturing, and industrial fuels' },
              ].map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0e141f] border border-white/10 space-y-1">
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The "Maximum Sub-Index" Principle
            </h2>
            <p>
              A crucial distinction in Indian AQI is how the final single number is derived. The overall AQI is <strong>not</strong> an
              average of all eight pollutants. Instead, it is governed by the <em>worst</em> (highest) sub-index among them.
            </p>
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
              <strong className="text-white block mb-1">Key Rule:</strong>
              If PM2.5 indicates an AQI sub-index of 380 (Severe), but SO2 and NO2 are in the "Good" band (sub-index 35),
              the reported overall AQI is <strong>380</strong>. The most harmful pollutant dictates the composite health risk.
            </div>
            <p>
              In Delhi NCR and throughout northern India during the autumn and winter months, <strong>PM2.5</strong> is
              almost universally the governing pollutant that drives the headline AQI number.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Indian NAQI vs. US AQI: Are They the Same?
            </h2>
            <p>
              No. While both indices share the 0 to 500 numeric range, their underlying breakpoint tables differ significantly:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
              <li>
                <strong>US EPA AQI:</strong> A PM2.5 level of 35.4 &micro;g/m&sup3; reaches an AQI of 100.
              </li>
              <li>
                <strong>Indian NAQI:</strong> A PM2.5 level of 60 &micro;g/m&sup3; corresponds to an AQI of 100 (Satisfactory).
              </li>
              <li>
                This means a reading of 200 on an Indian NAQI scale corresponds to higher particulate concentrations than 200 on the US scale. AirScope India strictly reports official <strong>CPCB Indian NAQI</strong> values so local residents receive authentic benchmarks.
              </li>
            </ul>
          </section>
        </article>

        {/* Related Guides & Navigation */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Next Guides in This Series</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/pm25-vs-pm10"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Particulate Matter</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                PM2.5 vs PM10: Size & Health Risks →
              </h3>
            </Link>
            <Link
              href="/learn/indian-aqi-categories"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Color Categories</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                The 6 Indian AQI Categories Explained →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
