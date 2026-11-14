import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/LegalPage';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About AirScope India and our data sources',
  description:
    'How AirScope India gets Delhi NCR air quality data from CPCB, DPCC, UPPCB and HSPCB stations, how AQI is calculated, and what estimated values mean.',
  alternates: { canonical: `${getSiteUrl()}/about` },
};

export default function AboutPage() {
  return (
    <LegalPage title="About AirScope India" updated="14 November 2026">
      <p>
        AirScope India is a free, independent air quality tracker for Delhi NCR: Delhi, Noida, Greater Noida, Gurugram,
        Faridabad and Ghaziabad. It shows the latest official readings for PM2.5, PM10 and other pollutants and converts
        them to the Indian National Air Quality Index (NAQI).
      </p>
      <h2>Where the numbers come from</h2>
      <ul>
        <li>
          <strong>Official stations:</strong> continuous ambient air quality monitoring stations run by the Central Pollution
          Control Board (CPCB), Delhi Pollution Control Committee (DPCC), Uttar Pradesh Pollution Control Board and Haryana
          State Pollution Control Board, published through the Open Government Data Platform India (data.gov.in) under the
          Government Open Data License - India.
        </li>
        <li>
          <strong>OpenAQ:</strong> a second open feed of government monitors, used to cross-check and to fill gaps when a station
          is slow to report on the first feed.
        </li>
        <li>
          <strong>Estimates (clearly marked):</strong> when a station is offline, or you search a place with no monitor within
          about 3 km, we estimate it from up to three nearby working stations (closer stations count more) and show it with a ≈
          sign. If no station is within 15 km we fall back to the Copernicus CAMS atmospheric model via Open-Meteo. Estimates are
          not sensor readings, can differ from the air at your exact spot, and are never used in our averages or
          highest/lowest rankings.</li>
      </ul>
      <h2>How AQI is calculated</h2>
      <p>
        We apply the CPCB breakpoint tables to each pollutant and report the highest sub-index, which is how the Indian NAQI
        works. A reading needs particulate matter and at least three pollutants to count as a valid AQI. Learn more in{' '}
        <Link href="/learn/how-aqi-is-calculated">How AQI is calculated</Link>.
      </p>
      <h2>Freshness</h2>
      <p>
        Station data is typically updated hourly. A reading older than one hour is marked Delayed and older than three hours
        is marked Stale. Our server refreshes data about every 10 minutes.
      </p>
      <h2>Independence</h2>
      <p>
        AirScope India is not affiliated with or endorsed by the Government of India, CPCB or any pollution control board.
        The site is supported by advertising and affiliate links. Product recommendations are chosen on filtration performance
        and never change the air quality numbers we show.
      </p>
      <p>
        Questions or corrections? See <Link href="/contact">Contact</Link>.
      </p>
    </LegalPage>
  );
}
