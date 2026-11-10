import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DELHI_NCR_STATIONS } from '@/lib/fixtures/delhi-stations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MapPin, ShieldCheck, ArrowLeft, Wind } from 'lucide-react';

interface CityPageProps {
  params: {
    city: string;
  };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : 'https://airscope-india.onrender.com';

const CITY_DATA: Record<
  string,
  {
    name: string;
    state: string;
    title: string;
    description: string;
    overview: string;
    airPollutionProfile: string;
    healthContext: string;
    faqs: Array<{ q: string; a: string }>;
  }
> = {
  delhi: {
    name: 'Delhi',
    state: 'Delhi (NCT)',
    title: 'Delhi AQI Today — Live Air Quality Index, PM2.5 & Pollution Levels',
    description:
      'Check real-time Delhi AQI today. Continuous monitoring across Anand Vihar, Dwarka, Rohini, ITO, and 20+ DPCC/CPCB stations with official health advisories.',
    overview:
      'Delhi features the highest density of continuous ambient air quality monitoring stations in India, operated by the Delhi Pollution Control Committee (DPCC), CPCB, and IMD.',
    airPollutionProfile:
      'Winter air quality in Delhi is heavily impacted by meteorological temperature inversions, regional biomass emissions, vehicular exhaust, and road dust.',
    healthContext:
      'During periods of Poor and Severe AQI (NAQI > 250), health authorities advise avoiding morning jogs, using certified N95 respirators, and keeping HEPA purifiers active.',
    faqs: [
      {
        q: 'What is Delhi AQI today?',
        a: 'Delhi AQI today is available live from official DPCC and CPCB continuous monitoring stations. Delhi frequently experiences Poor to Severe AQI during winter months (October–February) due to crop residue burning, vehicular traffic, and atmospheric temperature inversions.',
      },
      {
        q: 'Which areas in Delhi have the worst air quality?',
        a: 'Historically, Anand Vihar, Jahangirpuri, Bawana, Wazirpur, and Narela record some of Delhi’s highest PM2.5 concentrations, largely due to industrial activity, logistics depots, and highway transit density.',
      },
      {
        q: 'Is Delhi AQI dangerous for children and senior citizens?',
        a: 'Children and senior citizens are particularly vulnerable. When Delhi AQI exceeds 200 (Poor band), health guidelines strongly recommend wearing certified N95 respirators, curtailing outdoor physical activities, and deploying HEPA air purifiers indoors.',
      },
      {
        q: 'How is AQI calculated in Delhi?',
        a: 'The National AQI (NAQI) for Delhi follows the official CPCB linear interpolation formula, computing the worst sub-index across eight criteria pollutants: PM2.5, PM10, NO2, SO2, CO, NH3, O3, and Pb.',
      },
    ],
  },
  noida: {
    name: 'Noida',
    state: 'Uttar Pradesh',
    title: 'Noida AQI Today — Real-Time Air Quality & PM2.5 Monitoring',
    description:
      'Live Noida AQI today. Hyperlocal air quality readings from Sector-62, Sector-125, and Sector-1 stations based on official UPPCB and CPCB feeds.',
    overview:
      'Noida is monitored continuously via automated stations situated in major industrial, tech corridor, and residential sectors under the Uttar Pradesh Pollution Control Board (UPPCB).',
    airPollutionProfile:
      'Pollution levels in Noida correlate strongly with transit traffic along the Noida-Greater Noida Expressway and regional particulate dispersion from the Yamuna floodplain.',
    healthContext:
      'Residents in Sector 62 and central Noida are advised to keep indoor air clean during morning peak hours and monitor real-time sensor updates.',
    faqs: [
      {
        q: 'What is Noida AQI today?',
        a: 'Noida AQI today is measured by UPPCB and CPCB stations across Sector 62, Sector 125, and Sector 1. Noida experiences elevated PM2.5 during winter months and during active construction periods.',
      },
      {
        q: 'Is Noida air quality safe today?',
        a: 'Air quality safety in Noida depends on current AQI readings. NAQI values up to 100 are generally considered safe for healthy adults. When PM2.5 or PM10 is elevated (AQI > 200), sensitive individuals should take precautions.',
      },
    ],
  },
  gurugram: {
    name: 'Gurugram',
    state: 'Haryana',
    title: 'Gurugram AQI Today — Live Air Quality Index & Sensor Readings',
    description:
      'Real-time Gurugram AQI today. Live PM2.5 and PM10 telemetry from Vikas Sadan, Sector-51, Teri Gram, and NISE Gwal Pahari HSPCB stations.',
    overview:
      'Gurugram’s air quality is continuously recorded by the Haryana State Pollution Control Board (HSPCB) across residential, commercial, and Aravalli perimeter zones.',
    airPollutionProfile:
      'Construction activity, NH-48 vehicular congestion, and seasonal particulate drift from agricultural belts contribute to elevated PM2.5 and PM10 concentrations.',
    healthContext:
      'Outdoor exercise should be moderated during periods when ambient AQI crosses the Moderate band (>100). Sensitive individuals should take active precautions.',
    faqs: [
      {
        q: 'What is Gurugram AQI today?',
        a: 'Gurugram AQI today is monitored by HSPCB across four stations including Vikas Sadan and Sector 51. Gurugram pollution is influenced by NH-48 traffic, construction activity, and seasonal wind patterns from agricultural regions.',
      },
      {
        q: 'How does Gurugram air quality compare to Delhi?',
        a: 'Gurugram generally experiences similar AQI patterns to Delhi NCR during winter, though some western sectors near the Aravalli green belt record slightly lower pollution. Industrial and highway corridors tend to show higher readings.',
      },
    ],
  },
  ghaziabad: {
    name: 'Ghaziabad',
    state: 'Uttar Pradesh',
    title: 'Ghaziabad AQI Today — Real-Time Air Quality Index & Telemetry',
    description:
      'Track live Ghaziabad AQI today. Continuous CAAQMS readings from Vasundhara, Indirapuram, Sanjay Nagar, and Loni stations via UPPCB.',
    overview:
      'Ghaziabad hosts several continuous air quality monitoring stations tracking major industrial nodes, transit highways, and dense residential sectors.',
    airPollutionProfile:
      'High traffic density on GT Road and regional industrial clusters often lead to higher baseline particulate readings relative to other parts of NCR.',
    healthContext:
      'Vulnerable residents in Vasundhara and Indirapuram should utilize True HEPA filtration indoors during prolonged high-pollution spells.',
    faqs: [
      {
        q: 'What is Ghaziabad AQI today?',
        a: 'Ghaziabad AQI today is tracked by UPPCB monitoring stations in Vasundhara, Indirapuram, Sanjay Nagar, and Loni. Industrial activity and GT Road traffic are primary pollution contributors.',
      },
      {
        q: 'Is Ghaziabad more polluted than Delhi?',
        a: 'Ghaziabad is frequently among the most polluted cities in the NCR. The Loni area in particular often records among the highest PM2.5 concentrations in the region, driven by industrial emissions and cross-border particulate transport.',
      },
    ],
  },
  faridabad: {
    name: 'Faridabad',
    state: 'Haryana',
    title: 'Faridabad AQI Today — Live Air Quality Index & PM2.5 Stats',
    description:
      'Check real-time Faridabad AQI today. Continuous CAAQMS data from Sector 16A, Sector 30, and Sector 11 stations via HSPCB and CPCB.',
    overview:
      'Faridabad’s continuous monitoring stations provide hourly telemetry on particulate matter and industrial gases across key residential and industrial sectors.',
    airPollutionProfile:
      'Industrial manufacturing, diesel freight movement on Mathura Road, and regional wind stagnation during autumn/winter drive seasonal AQI spikes.',
    healthContext:
      'Residents are encouraged to verify current readings before planning intense outdoor physical exertion.',
    faqs: [
      {
        q: 'What is Faridabad AQI today?',
        a: 'Faridabad AQI today is measured by HSPCB continuous monitoring stations across Sectors 16A, 30, and 11. Industrial manufacturing and Mathura Road traffic are significant pollution contributors.',
      },
      {
        q: 'How polluted is Faridabad compared to Delhi?',
        a: 'Faridabad experiences AQI patterns comparable to southern Delhi, with industrial areas typically recording higher PM2.5 and PM10. The city shows strong seasonality, with peak pollution in November–January.',
      },
    ],
  },
};

export async function generateStaticParams() {
  return [
    { city: 'delhi' },
    { city: 'noida' },
    { city: 'gurugram' },
    { city: 'ghaziabad' },
    { city: 'faridabad' },
  ];
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const cityInfo = CITY_DATA[params.city.toLowerCase()];
  if (!cityInfo) return {};

  const url = `${siteUrl}/${params.city.toLowerCase()}`;

  return {
    title: cityInfo.title,
    description: cityInfo.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: cityInfo.title,
      description: cityInfo.description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: cityInfo.title,
      description: cityInfo.description,
    },
  };
}

export default function CityPage({ params }: CityPageProps) {
  const cityKey = params.city.toLowerCase();
  const cityInfo = CITY_DATA[cityKey];

  if (!cityInfo) {
    notFound();
  }

  // Filter stations for this city
  const cityStations = DELHI_NCR_STATIONS.filter(
    (s) => s.city.toLowerCase() === cityInfo.name.toLowerCase()
  );

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: `${cityInfo.name} AQI`, item: `${siteUrl}/${cityKey}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cityInfo.faqs.map((faq) => ({
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
          <Link href="/" className="hover:text-emerald-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{cityInfo.name}</span>
        </nav>

        {/* City Hero */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span>{cityInfo.state}</span>
            <span>•</span>
            <span>{cityStations.length} Continuous CAAQMS Stations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {cityInfo.name} Air Quality Index (AQI) Live
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
            {cityInfo.overview}
          </p>
        </div>

        {/* City Stations Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>Continuous Monitoring Stations in {cityInfo.name}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityStations.map((station) => (
              <div
                key={station.id}
                className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                    Agency: {station.agency}
                  </span>
                  <span className="text-xs font-mono text-emerald-400">● Monitored</span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">{station.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-snug">{station.address}</p>
                </div>

                <div className="text-[11px] font-mono text-gray-400 border-t border-white/5 pt-2 flex items-center justify-between">
                  <span>GPS: {station.latitude.toFixed(4)}°N, {station.longitude.toFixed(4)}°E</span>
                  <Link
                    href={`/?station=${station.id}#live-aqi`}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    View Live Feed →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Pollution Profile & Seasonality</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {cityInfo.airPollutionProfile}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Health Precautions & Guidance</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {cityInfo.healthContext}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {cityInfo.faqs.map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#0e141f] border border-white/10">
                <h3 className="font-semibold text-sm text-white mb-2">{faq.q}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

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
            <Link href="/learn/indian-aqi-categories" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
              India AQI Categories →
            </Link>
            <Link href="/learn/air-pollution-health-effects" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors">
              Health Effects →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
