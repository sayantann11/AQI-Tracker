import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Activity, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://airscope-india.onrender.com';

export const metadata: Metadata = {
  title: 'PM2.5 vs PM10: Size, Differences & Health Impacts Explained',
  description:
    'Learn the key differences between PM2.5 and PM10 particulate matter. Understand their biological danger, micro-sizes, sources in Delhi NCR, and why fine dust enters the bloodstream.',
  alternates: {
    canonical: `${siteUrl}/learn/pm25-vs-pm10`,
  },
  openGraph: {
    title: 'PM2.5 vs PM10: Differences & Health Impacts | AirScope India',
    description:
      'Comparison between coarse PM10 and fine PM2.5 particles, including microscopic scale comparisons and health advisories.',
    url: `${siteUrl}/learn/pm25-vs-pm10`,
    type: 'article',
  },
};

export default function PM25vsPM10Page() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'PM2.5 vs PM10: Size, Differences & Health Impacts Explained',
    description:
      'Detailed scientific comparison between PM2.5 and PM10 particulate matter in Delhi NCR air pollution.',
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
    datePublished: '2024-01-20T00:00:00+05:30',
    dateModified: '2024-11-01T00:00:00+05:30',
    mainEntityOfPage: `${siteUrl}/learn/pm25-vs-pm10`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Knowledge Centre', item: `${siteUrl}/learn` },
      { '@type': 'ListItem', position: 3, name: 'PM2.5 vs PM10', item: `${siteUrl}/learn/pm25-vs-pm10` },
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
          <span className="text-white font-medium">PM2.5 vs PM10</span>
        </nav>

        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
            <span>Particulate Science</span>
            <span>•</span>
            <span>5 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            PM2.5 vs PM10: Size, Sources, and Why Fine Particles Matter
          </h1>

          <p className="text-base text-gray-300 leading-relaxed">
            When checking air quality in Delhi, Noida, or Gurugram, two acronyms dominate the data:
            <strong> PM2.5</strong> and <strong>PM10</strong>. Here is what they actually mean, how small they
            really are, and why one is dramatically more dangerous to human organs than the other.
          </p>
        </header>

        <article className="prose prose-invert max-w-none text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          {/* Visual Comparison Box */}
          <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white">Scale Comparison: How Small Are They?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-emerald-400 font-mono font-bold block text-sm">Human Hair</span>
                <span className="text-lg font-extrabold text-white">50–70 &micro;m</span>
                <p className="text-gray-400">Average human hair diameter. Visible to the naked human eye.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-amber-400 font-mono font-bold block text-sm">PM10 (Coarse)</span>
                <span className="text-lg font-extrabold text-white">&le; 10 &micro;m</span>
                <p className="text-gray-300">Dust, pollen, mould. About 5x smaller than a strand of hair.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <span className="text-rose-400 font-mono font-bold block text-sm">PM2.5 (Fine)</span>
                <span className="text-lg font-extrabold text-white">&le; 2.5 &micro;m</span>
                <p className="text-gray-300">Combustion soot, metals. 30x smaller than a strand of human hair.</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              What is PM10? (Coarse Particulate Matter)
            </h2>
            <p>
              PM10 refers to inhalable particles with diameters that are generally 10 micrometres and smaller.
              These include dust from roads, construction sites, unpaved surfaces, industrial fly ash, and pollen.
            </p>
            <p>
              <strong>Biological Filter:</strong> Because of their relatively larger size, the human body's natural defense
              mechanisms—specifically nose hairs, mucous membranes, and upper bronchial cilia—trap a substantial portion of
              PM10 before it reaches deep lung tissue. It primarily causes irritation in the upper respiratory tract: coughing,
              sneezing, nasal congestion, and eye burning.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              What is PM2.5? (Fine Particulate Matter)
            </h2>
            <p>
              PM2.5 refers to fine particles with aerodynamic diameters equal to or less than 2.5 micrometres. These particles
              originate mainly from combustion processes: diesel engines, biomass burning (crop residue), coal power plants,
              waste burning, and photochemical reactions between gases.
            </p>
            <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm space-y-2">
              <strong className="text-white block font-bold text-base">Why PM2.5 Bypasses Human Defenses</strong>
              <p>
                PM2.5 is so tiny that it completely bypasses the upper airway filters. It travels down into the deepest
                alveoli (air sacs) of the lungs, where oxygen transfer occurs. From there, ultra-fine fractions can cross
                directly into the <strong>bloodstream</strong>, inducing systemic inflammation, blood vessel damage, arterial plaque
                rupture, and strain on cardiac muscle.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Indian CPCB Standards vs. WHO Safe Limits
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl">
                <thead className="bg-white/5 border-b border-white/10 text-gray-300">
                  <tr>
                    <th className="p-3 font-semibold">Pollutant</th>
                    <th className="p-3 font-semibold">Indian Standard (24-hr)</th>
                    <th className="p-3 font-semibold">WHO 2021 Guideline (24-hr)</th>
                    <th className="p-3 font-semibold">Ratio (India vs WHO)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr>
                    <td className="p-3 font-bold text-white">PM2.5</td>
                    <td className="p-3 font-mono text-emerald-400">60 &micro;g/m&sup3;</td>
                    <td className="p-3 font-mono text-cyan-400">15 &micro;g/m&sup3;</td>
                    <td className="p-3">4x higher than WHO</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-white">PM10</td>
                    <td className="p-3 font-mono text-emerald-400">100 &micro;g/m&sup3;</td>
                    <td className="p-3 font-mono text-cyan-400">45 &micro;g/m&sup3;</td>
                    <td className="p-3">2.2x higher than WHO</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">
              During peak winter pollution episodes in Delhi NCR, 24-hour PM2.5 concentrations can surge past
              400–600 &micro;g/m&sup3;—exceeding WHO guidelines by 25 to 40 times.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Can Regular Cloth or Surgical Masks Block PM2.5?
            </h2>
            <p>
              No. Cloth masks, handkerchiefs, and standard surgical blue masks only filter large droplets and coarse PM10.
              The weave of cloth allows microscopic PM2.5 particles to flow freely through the fabric and gaps around the nose.
            </p>
            <p>
              To effectively filter PM2.5, you need certified <strong>N95, N99, or FFP2 respirators</strong> with electrostatic
              melt-blown layers that trap fine particles when fitted tightly against the face.
            </p>
          </section>
        </article>

        {/* Next Guides */}
        <div className="pt-8 border-t border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white">Continue Learning</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/learn/indian-aqi-categories"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Categories</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                The 6 Indian AQI Categories Explained →
              </h3>
            </Link>
            <Link
              href="/learn/air-pollution-health-effects"
              className="p-4 rounded-xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-1 group"
            >
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Health</span>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                How Air Pollution Impacts Human Health →
              </h3>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
