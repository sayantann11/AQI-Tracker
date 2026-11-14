import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ShieldAlert, Heart, Activity, CheckCircle2 } from 'lucide-react';
import { getSiteUrl } from '@/lib/site';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: 'Health Effects of Air Pollution & Protection Guide | AirScope India',
  description:
    'Science-backed guide on how air pollution damages human organs. Learn essential protections: certified N95 masks, HEPA purifiers, morning walk precautions, and vulnerable group care.',
  alternates: {
    canonical: `${siteUrl}/learn/air-pollution-health-effects`,
  },
  openGraph: {
    title: 'Health Effects of Air Pollution & Protection Guide | AirScope India',
    description:
      'Understand the biological risks of PM2.5, acute and chronic health effects, and practical ways to protect yourself in Delhi NCR.',
    url: `${siteUrl}/learn/air-pollution-health-effects`,
    type: 'article',
  },
};

export default function AirPollutionHealthEffectsPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Health Effects of Air Pollution & How to Protect Yourself',
    description:
      'Medical and scientific overview of air pollution health impacts and protective measures in Delhi NCR.',
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
    datePublished: '2024-01-28T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/air-pollution-health-effects`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'Health Effects', item: `${siteUrl}/learn/air-pollution-health-effects` },
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
          <span className="text-white font-medium">Health Effects & Protection</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400">
            <span>Health Advisory</span>
            <span>•</span>
            <span>5 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Health Effects of Air Pollution & How to Protect Yourself
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            Air pollution in northern India is often referred to as a "silent emergency." Inhaling toxic particulate
            cocktails has measurable, systemic effects on the lungs, cardiovascular system, and brain.
          </p>
        </header>

        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Short-Term vs. Long-Term Health Impacts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base text-amber-400">Acute Effects (Hours to Days)</h3>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1">
                  <li>Eye irritation, burning sensations, redness</li>
                  <li>Sore throat, dry persistent coughing, wheezing</li>
                  <li>Asthma exacerbations, acute bronchitis episodes</li>
                  <li>Headaches, fatigue, reduced cognitive alertness</li>
                  <li>Increased hospital emergency room visits for COPD</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-base text-rose-400">Chronic Effects (Months to Years)</h3>
                <ul className="list-disc pl-5 text-xs text-gray-300 space-y-1">
                  <li>Irreversible reduction in childhood lung capacity development</li>
                  <li>Coronary artery disease, elevated hypertension, strokes</li>
                  <li>Elevated risks of lung cancer (PM2.5 is a Group 1 carcinogen)</li>
                  <li>Metabolic syndrome and insulin resistance complications</li>
                  <li>Accelerated cognitive decline and dementia onset</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Evidence-Based Protective Steps for Delhi NCR Residents
            </h2>
            <div className="space-y-3">
              <div className="p-5 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">1</span>
                  Wear Certified N95 or N99 Respirators
                </h3>
                <p className="text-xs text-gray-300">
                  Cloth and standard surgical masks provide near-zero filtration for microscopic PM2.5. Use certified
                  N95 / FFP2 respirators with tight facial seals whenever outdoor AQI exceeds 200. Ensure no air leaks around
                  the nasal bridge.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">2</span>
                  Reschedule Outdoor Workouts & Morning Walks
                </h3>
                <p className="text-xs text-gray-300">
                  During winter, overnight cold air settles near the ground, causing surface temperature inversions.
                  Pollution concentrations are highest between <strong>5:00 AM and 9:00 AM</strong>. Shift outdoor runs
                  or workouts to early afternoons when sunlight and thermal convection disperse surface particulates.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e141f] border border-white/10 space-y-2">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">3</span>
                  Deploy True HEPA (H13) Air Purifiers Indoors
                </h3>
                <p className="text-xs text-gray-300">
                  Indoor air often equilibrates to 60–80% of outdoor pollution levels without filtration. Use true HEPA
                  purifiers rated H13 or higher in bedrooms, seal window crevices, and avoid burning incense sticks or mosquito
                  coils indoors.
                </p>
              </div>
            </div>
          </section>
        </article>

        {/* Links */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Continue Reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/delhi-pollution-guide"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Winter Inversion</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                Why Delhi Pollution Spikes in Winter →
              </h3>
            </Link>
            <Link
              href="/learn/how-to-read-aqi"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Practical Guide</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                How to Read Live AQI Data Daily →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
