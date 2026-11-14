import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DELHI_NCR_STATIONS, POPULAR_UNMONITORED_LOCALITIES } from '@/lib/fixtures/delhi-stations';
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

const LOCALITY_EDITORIAL: Record<
  string,
  {
    title: string;
    description: string;
    editorial: string;
    localSources: string;
    stationId: string;
  }
> = {
  'anand-vihar': {
    stationId: 'delhi-anand-vihar',
    title: 'Anand Vihar AQI Today — Live PM2.5, PM10 & Pollution Index | Delhi',
    description:
      'Live Anand Vihar AQI today. Continuous DPCC air quality monitoring near ISBT Anand Vihar, East Delhi. Real-time PM2.5, PM10, and health advisory.',
    editorial:
      'Anand Vihar frequently records some of the highest particulate readings in Delhi NCR due to its position as a major transit junction, hosting interstate bus terminals, rail corridors, and close proximity to the Ghazipur industrial zone.',
    localSources:
      'Heavy diesel interstate bus emissions, idling traffic at border checkpoints, dust suspension from transit corridors, and regional eastern particulate inflow.',
  },
  dwarka: {
    stationId: 'delhi-dwarka-sec8',
    title: 'Dwarka AQI Today — Real-Time PM2.5 & Air Quality | South West Delhi',
    description:
      'Check live Dwarka Sector 8 AQI today. Continuous CAAQMS monitoring station at NIMR campus in South West Delhi with real-time NAQI readings.',
    editorial:
      'Dwarka is a planned residential sub-city located in South West Delhi, in proximity to the IGI Airport and the Dwarka Expressway. Air quality here is influenced by cross-boundary particulate flows from Haryana and aviation transit.',
    localSources:
      'Airport perimeter transit, ongoing highway construction, local residential generators, and southwest seasonal dust transport.',
  },
  rohini: {
    stationId: 'delhi-rohini-sec16',
    title: 'Rohini AQI Today — Live Air Quality Index & PM2.5 | North West Delhi',
    description:
      'Track real-time Rohini Sector 16 AQI today. Continuous DPCC monitoring station in North West Delhi with live PM2.5, PM10, and health warnings.',
    editorial:
      'Located in North West Delhi, Rohini’s monitoring station provides crucial data for dense northern suburbs, capturing emissions from the outer ring road and surrounding mixed commercial-residential clusters.',
    localSources:
      'Outer ring road vehicular flow, biomass burning during autumn/winter crop harvesting seasons in neighbouring agrarian belts, and urban road dust.',
  },
  ito: {
    stationId: 'delhi-ito',
    title: 'ITO AQI Today — Live Air Quality & Pollution Levels | Central Delhi',
    description:
      'Real-time ITO AQI today. CPCB continuous monitoring station at ITO intersection, Central Delhi. Live PM2.5, PM10, NO2 and health advisory.',
    editorial:
      'ITO is one of Delhi’s most congested intersections, situated at the junction of Bahadur Shah Zafar Marg and Vikas Marg. The monitoring station records high vehicular emission inputs due to 24-hour commercial and commuter traffic.',
    localSources:
      'Dense vehicular intersection emissions, commercial vehicle corridors, construction activities along the Yamuna riverfront, and central Delhi urban heat.',
  },
  'ashok-vihar': {
    stationId: 'delhi-ashok-vihar',
    title: 'Ashok Vihar AQI Today — Live Air Quality Index | North West Delhi',
    description:
      'Live Ashok Vihar AQI today. Continuous DPCC monitoring in North West Delhi at Satyawati College campus. Real-time NAQI, PM2.5, PM10 readings.',
    editorial:
      'Ashok Vihar is a mid-density residential and commercial locality in North West Delhi. The monitoring station at Satyawati College captures suburban emission patterns from road traffic and local industries.',
    localSources:
      'Ring road traffic, local manufacturing units, residential generator sets during power outages, and dust from construction on major road corridors.',
  },
  bawana: {
    stationId: 'delhi-bawana',
    title: 'Bawana AQI Today — Live Air Quality & Industrial Pollution | North Delhi',
    description:
      'Track live Bawana AQI today. DPCC continuous monitoring station near Bawana Industrial Area, North West Delhi. Real-time PM2.5, PM10 and pollution data.',
    editorial:
      'Bawana hosts one of Delhi’s largest industrial clusters. The area frequently records elevated particulate levels due to heavy industrial activity, landfill proximity, and location at Delhi’s northern boundary where particulate dispersion is limited.',
    localSources:
      'Industrial manufacturing emissions, Bawana Industrial Estate operations, Bhalswa landfill particulate, and low-wind stagnation common in this region.',
  },
  'mandir-marg': {
    stationId: 'delhi-mandir-marg',
    title: 'Mandir Marg AQI Today — Live Air Quality | Central Delhi',
    description:
      'Live Mandir Marg AQI today. DPCC continuous air quality monitoring in Central Delhi at N.P. Boys School campus. Real-time PM2.5, PM10 readings.',
    editorial:
      'Mandir Marg monitoring station is situated in Central Delhi, providing air quality data for the dense commercial and residential core of New Delhi district, including Connaught Place proximity.',
    localSources:
      'Central Delhi vehicular traffic, commercial heating and cooling systems, construction dust in New Delhi development corridors.',
  },
  'punjabi-bagh': {
    stationId: 'delhi-punjabi-bagh',
    title: 'Punjabi Bagh AQI Today — Live Air Quality Index | West Delhi',
    description:
      'Check real-time Punjabi Bagh AQI today. DPCC monitoring station on Ring Road, West Delhi. Live PM2.5, PM10, and pollution advisory.',
    editorial:
      'Punjabi Bagh monitoring station on Ring Road captures mixed residential-commercial emission signatures in West Delhi, influenced heavily by ring road vehicular throughput and proximity to Shadipur industrial cluster.',
    localSources:
      'Ring Road heavy-vehicle transit, Shadipur industrial emissions, residential solid waste burning, and western wind transport of particulates.',
  },
  'rk-puram': {
    stationId: 'delhi-rk-puram',
    title: 'R.K. Puram AQI Today — Live Air Quality | South West Delhi',
    description:
      'Track live R.K. Puram AQI today. DPCC continuous monitoring in South West Delhi at Kendriya Vidyalaya, Sector 2. Real-time NAQI, PM2.5, PM10.',
    editorial:
      'R.K. Puram is an upscale residential locality in South West Delhi adjacent to Vasant Kunj and Delhi Cantt. It generally records lower pollution than North Delhi, but monitors pollution from Ring Road and Dhaula Kuan junction.',
    localSources:
      'NH-48 and Ring Road vehicular emission, government complex generators, low-lying topography trapping inversions during winter.',
  },
  jahangirpuri: {
    stationId: 'delhi-jahangirpuri',
    title: 'Jahangirpuri AQI Today — Live Air Quality & Pollution | North Delhi',
    description:
      'Live Jahangirpuri AQI today. DPCC continuous monitoring in North West Delhi. Real-time PM2.5, PM10, and industrial pollution data.',
    editorial:
      'Jahangirpuri consistently records among Delhi’s highest PM2.5 concentrations due to its location adjacent to major industrial areas, landfills, and high-density informal settlements with solid waste burning.',
    localSources:
      'Bhalswa landfill fires and decomposition, Jahangirpuri industrial area, solid waste burning, dense traffic on outer ring road.',
  },
  okhla: {
    stationId: 'delhi-okhla-ph2',
    title: 'Okhla AQI Today — Live Air Quality Index | South Delhi',
    description:
      'Check live Okhla Phase 2 AQI today. DPCC continuous monitoring in South Delhi at DITE campus. Real-time PM2.5, PM10, and air quality advisory.',
    editorial:
      'Okhla Phase II monitoring station in South Delhi captures emission profiles from one of Delhi’s prominent industrial estates. The area shows elevated NOx and particulate readings during daytime production hours.',
    localSources:
      'Okhla Industrial Estate manufacturing, highway traffic on NH-19, Yamuna floodplain dust, and cross-boundary particulate from Noida industrial areas.',
  },
  'sonia-vihar': {
    stationId: 'delhi-sonia-vihar',
    title: 'Sonia Vihar AQI Today — Live Air Quality | North East Delhi',
    description:
      'Live Sonia Vihar AQI today. DPCC monitoring station near Sonia Vihar Water Treatment Plant, North East Delhi. Real-time PM2.5 and NAQI readings.',
    editorial:
      'Sonia Vihar is located in North East Delhi near the Yamuna floodplain. The monitoring station is sited at the Water Treatment Plant campus, tracking air quality for a rapidly urbanising northeastern zone.',
    localSources:
      'Yamuna riverbed dust, north-eastern boundary industrial activity, transit corridor emissions, and seasonal agricultural burning from UP border districts.',
  },
  patparganj: {
    stationId: 'delhi-patparganj',
    title: 'Patparganj AQI Today — Live Air Quality | East Delhi',
    description:
      'Track live Patparganj AQI today. DPCC monitoring station at Mother Dairy Plant, East Delhi. Real-time PM2.5, PM10, and pollution advisory.',
    editorial:
      'Patparganj in East Delhi sits adjacent to the Yamuna floodplain industrial zone and major road arteries connecting to Noida. The monitoring station records mixed industrial and vehicular emission signatures.',
    localSources:
      'Noida border industrial activity, Patparganj Industrial Area, National Highway 24 vehicular emissions, and Yamuna riverbed particulate dust.',
  },
  'vivek-vihar': {
    stationId: 'delhi-vivek-vihar',
    title: 'Vivek Vihar AQI Today — Live Air Quality | Shahdara, Delhi',
    description:
      'Check live Vivek Vihar AQI today. DPCC monitoring in Shahdara district, East Delhi. Real-time PM2.5, PM10, and air quality index.',
    editorial:
      'Vivek Vihar monitoring station in Shahdara, East Delhi, captures pollution from one of Delhi’s most densely populated east-bank districts. The station tracks residential and arterial road emissions.',
    localSources:
      'Shahdara road corridor traffic, border crossing emissions from UP, industrial activity in nearby Patparganj, and regional cross-boundary particulate.',
  },
  wazirpur: {
    stationId: 'delhi-wazirpur',
    title: 'Wazirpur AQI Today — Live Air Quality & Industrial Pollution | North Delhi',
    description:
      'Live Wazirpur AQI today. DPCC monitoring station in Wazirpur Industrial Area, North Delhi. Real-time PM2.5, PM10, and pollution data.',
    editorial:
      'Wazirpur is home to one of Delhi’s most prominent industrial clusters, with steel re-rolling, chemical, and manufacturing units concentrated in a compact zone. It regularly records elevated PM2.5 and PM10 levels.',
    localSources:
      'Wazirpur Industrial Area steel and chemical plant emissions, ring road traffic, and stagnant air pockets during winter temperature inversions.',
  },
  'jln-stadium': {
    stationId: 'delhi-jln-stadium',
    title: 'JLN Stadium AQI Today — Live Air Quality Index | Central Delhi',
    description:
      'Check live Jawaharlal Nehru Stadium AQI today. DPCC continuous air monitoring station in Pragati Vihar, Central Delhi. Real-time PM2.5 and health advisories.',
    editorial:
      'Jawaharlal Nehru Stadium monitoring station sits in Central-South Delhi near Pragati Vihar and Lodhi Road. Serving athletes and urban commuters, it monitors air quality in a mixed institutional, parkland, and transit corridor.',
    localSources:
      'Lodhi Road and Barapullah elevated corridor vehicular traffic, urban road dust, and winter temperature inversion pooling in low-lying stadium grounds.',
  },
  'dilshad-garden': {
    stationId: 'delhi-dilshad-garden',
    title: 'Dilshad Garden AQI Today — Live Air Quality | East Delhi',
    description:
      'Track live IHBAS Dilshad Garden AQI today. DPCC continuous CAAQMS monitoring station in Shahdara, East Delhi. Real-time PM2.5, PM10, and health stats.',
    editorial:
      'Situated at the Institute of Human Behaviour and Allied Sciences (IHBAS) campus in Dilshad Garden, this station tracks air pollution along Delhi’s eastern border with Ghaziabad, monitoring residential and medical zones.',
    localSources:
      'GT Road transit traffic, cross-border freight movement from Uttar Pradesh, local commercial diesel generators, and windborne particulate drift.',
  },
  burari: {
    stationId: 'delhi-burari',
    title: 'Burari Crossing AQI Today — Live Air Quality | North Delhi',
    description:
      'Live Burari Crossing AQI today. DPCC continuous monitoring station on Outer Ring Road, North Delhi. Real-time PM2.5, PM10 pollution data.',
    editorial:
      'Burari Crossing monitoring station sits at a critical junction of Outer Ring Road in North Delhi. The area bridges Delhi’s dense northern suburbs with the northern highway corridor connecting towards Haryana.',
    localSources:
      'Outer ring road heavy vehicle transit, North Delhi urban sprawl particulate, and seasonal northerly wind transport of agricultural burning emissions.',
  },
  'burari-crossing': {
    stationId: 'delhi-burari',
    title: 'Burari Crossing AQI Today — Live Air Quality | North Delhi',
    description:
      'Live Burari Crossing AQI today. DPCC continuous monitoring station on Outer Ring Road, North Delhi. Real-time PM2.5, PM10 pollution data.',
    editorial:
      'Burari Crossing monitoring station sits at a critical junction of Outer Ring Road in North Delhi. The area bridges Delhi’s dense northern suburbs with the northern highway corridor connecting towards Haryana.',
    localSources:
      'Outer ring road heavy vehicle transit, North Delhi urban sprawl particulate, and seasonal northerly wind transport of agricultural burning emissions.',
  },
};

const unmonitoredSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function generateStaticParams() {
  const delhiStations = DELHI_NCR_STATIONS.filter((s) => s.city === 'Delhi');
  const unmon = POPULAR_UNMONITORED_LOCALITIES
    .filter((u) => u.city === 'Delhi')
    .map((u) => ({ locality: unmonitoredSlug(u.name) }));
  return [...delhiStations.map((s) => ({ locality: s.slug })), ...unmon];
}

export async function generateMetadata({ params }: LocalityPageProps): Promise<Metadata> {
  const locKey = params.locality.toLowerCase();
  const editorial = LOCALITY_EDITORIAL[locKey];
  const station = DELHI_NCR_STATIONS.find((s) => s.slug === locKey && s.city === 'Delhi');

  if (!editorial || !station) {
    const unmon = POPULAR_UNMONITORED_LOCALITIES.find(
      (u) => u.city === 'Delhi' && unmonitoredSlug(u.name) === locKey,
    );
    if (unmon) {
      const title = `${unmon.name} AQI Today — Live Air Quality, PM2.5 & Pollution | Delhi | AirScope India`;
      const description = `${unmon.name} air quality index (AQI) today, estimated from the nearest CPCB/DPCC monitoring stations within 15 km. Live PM2.5, PM10 and health guidance for ${unmon.name}, South Delhi.`;
      const url = `${siteUrl}/delhi/${locKey}`;
      return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, type: 'website' },
        twitter: { card: 'summary_large_image', title, description },
      };
    }
    return {};
  }

  const url = `${siteUrl}/delhi/${locKey}`;

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


function UnmonitoredLocalityPage({ name, lat, lng, description }: { name: string; lat: number; lng: number; description: string }) {
  const url = `/?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`;
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <nav className="text-sm text-gray-400 mb-6">
          <a href="/" className="hover:text-white">Home</a> / {name}, Delhi
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{name} Air Quality (AQI) Today</h1>
        <p className="text-gray-300 mb-6">{description}</p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <p className="text-gray-200">
            There is no official CPCB station in {name}. We estimate live AQI here from the nearest monitoring stations.
          </p>
          <a
            href={url}
            className="inline-block px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            Show live AQI for {name} →
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-8">
          Based on distance-weighted interpolation of real-time readings from the CPCB CAAQMS network within 15 km, falling back to the ECMWF CAMS atmospheric model when no station is within range.
        </p>
      </div>
    </main>
  );
}

export default function LocalityPage({ params }: LocalityPageProps) {
  const locKey = params.locality.toLowerCase();
  const editorial = LOCALITY_EDITORIAL[locKey];
  const station = DELHI_NCR_STATIONS.find((s) => s.slug === locKey && s.city === 'Delhi');

  if (!editorial || !station) {
    const unmon = POPULAR_UNMONITORED_LOCALITIES.find(
      (u) => u.city === 'Delhi' && unmonitoredSlug(u.name) === locKey,
    );
    if (unmon) {
      return (
        <UnmonitoredLocalityPage
          name={unmon.name}
          lat={unmon.latitude}
          lng={unmon.longitude}
          description={unmon.description}
        />
      );
    }
    notFound();
  }

  const otherDelhi = DELHI_NCR_STATIONS.filter(
    (s) => s.city === 'Delhi' && s.slug !== locKey && LOCALITY_EDITORIAL[s.slug]
  ).slice(0, 8);

  const faqs = [
    {
      q: `What is ${station.name} AQI today?`,
      a: `${station.name} AQI today is tracked continuously by the ${station.agency} CAAQMS station located in ${station.city}, Delhi. Real-time PM2.5, PM10, and National AQI (NAQI) readings are updated hourly on AirScope India.`,
    },
    {
      q: `Why is air pollution high in ${station.name}?`,
      a: `Air quality in ${station.name} is primarily influenced by: ${editorial.localSources}`,
    },
    {
      q: `How can residents in ${station.name} protect their health?`,
      a: `When ambient AQI in ${station.name} exceeds 200 (Poor band), sensitive residents should limit outdoor exertion, wear certified N95 respirators during commutes, keep windows closed, and use HEPA air purifiers indoors. Check live AQI before outdoor exercise.`,
    },
  ];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Delhi AQI', item: `${siteUrl}/delhi` },
      { '@type': 'ListItem', position: 3, name: `${station.name} AQI`, item: `${siteUrl}/delhi/${locKey}` },
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
          <Link href="/delhi" className="hover:text-emerald-400">
            Delhi
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
              <h3 className="text-lg font-bold text-white">{station.name}, {station.city} — {station.agency}</h3>
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
          <h3 className="text-sm font-bold text-white">Compare Nearby Localities in Delhi</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {otherDelhi.map((s) => (
              <Link
                key={s.id}
                href={`/delhi/${s.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
              >
                {s.name} AQI →
              </Link>
            ))}
            <Link
              href="/delhi"
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-medium transition-colors"
            >
              All Delhi Stations →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
